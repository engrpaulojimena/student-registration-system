import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const result = await pool.query(
      "SELECT * FROM fmusers WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "pending") {
      return NextResponse.json({ error: "Your account is pending approval. Please wait for admin confirmation." }, { status: 403 });
    }

    if (user.status === "rejected") {
      return NextResponse.json({ error: "Your account has been rejected. Contact the administrator." }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(user.user_id, user.role);

    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
