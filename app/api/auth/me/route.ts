import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await pool.query(
    "SELECT full_name, email FROM fmusers WHERE user_id = $1",
    [session.userId]
  );

  if (result.rows.length === 0)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ fullName: result.rows[0].full_name, email: result.rows[0].email });
}
