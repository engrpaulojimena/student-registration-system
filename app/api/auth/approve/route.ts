import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const action = searchParams.get("action");

  if (!userId || !["approve", "reject"].includes(action ?? "")) {
    return new NextResponse("Invalid request.", { status: 400 });
  }

  if (action === "approve") {
    await pool.query(
      `UPDATE fmusers SET status = 'active', approved_at = NOW() WHERE user_id = $1`,
      [userId]
    );
    return new NextResponse(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0f111a;color:white;">
        <h2 style="color:#4ade80;">✓ Account Approved</h2>
        <p style="color:#94a3b8;">The user can now log in to EduTrack.</p>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } });
  } else {
    await pool.query(
      `UPDATE fmusers SET status = 'rejected' WHERE user_id = $1`,
      [userId]
    );
    return new NextResponse(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0f111a;color:white;">
        <h2 style="color:#f87171;">✗ Account Rejected</h2>
        <p style="color:#94a3b8;">The user's request has been rejected.</p>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } });
  }
}
