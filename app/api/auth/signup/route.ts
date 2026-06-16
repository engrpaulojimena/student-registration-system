import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Check if email already exists
    const existing = await pool.query(
      "SELECT user_id FROM fmusers WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user as pending
    const newUser = await pool.query(
      `INSERT INTO fmusers (email, password_hash, full_name, role, status)
       VALUES ($1, $2, $3, 'user', 'pending')
       RETURNING user_id`,
      [email.toLowerCase().trim(), passwordHash, fullName]
    );

    const userId = newUser.rows[0].user_id;

    // Send approval email to admin
    const approveUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/approve?userId=${userId}&action=approve`;
    const rejectUrl  = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/approve?userId=${userId}&action=reject`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"EduTrack System" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Account Request — EduTrack",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; background: #f9f9f9; padding: 32px; border-radius: 12px;">
          <h2 style="color: #1e90ff; margin-bottom: 4px;">New Sign-up Request</h2>
          <p style="color: #555; margin-bottom: 24px;">Someone requested access to EduTrack.</p>

          <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 8px 0; color: #888; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${fullName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Date</td><td style="padding: 8px 0;">${new Date().toLocaleString("en-PH")}</td></tr>
          </table>

          <div style="display: flex; gap: 12px;">
            <a href="${approveUrl}" style="background: #1e90ff; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 12px;">
              ✓ Approve
            </a>
            <a href="${rejectUrl}" style="background: #ef4444; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              ✗ Reject
            </a>
          </div>

          <p style="color: #aaa; font-size: 12px; margin-top: 24px;">EduTrack Registration System</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
