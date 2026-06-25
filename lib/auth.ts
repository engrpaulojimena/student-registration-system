import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { pool } from "./db";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "edutrack-secret-key");
const COOKIE_NAME = "edutrack_session";

export async function createSession(userId: number, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: number; role: string };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Returns the current logged-in user's full record from fmusers,
 * or null if not logged in / not found.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const result = await pool.query(
    "SELECT user_id, email, full_name, role, status FROM fmusers WHERE user_id = $1",
    [session.userId]
  );
  return result.rows[0] ?? null;
}

/**
 * Throws-free guard: returns true if current session role is super_admin.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "super_admin";
}
