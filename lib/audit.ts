import { pool } from "./db";
import { getSession } from "./auth";
import { headers } from "next/headers";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "APPROVE" | "REJECT";
export type EntityType  = "student" | "course" | "subject" | "enrollment" | "user";

/**
 * Logs an action to fmaudit_logs.
 * Call this inside any server action that creates, updates, deletes, or
 * otherwise mutates data — pass the affected entity type/id and a short
 * human-readable description.
 */
export async function logAction(
  action: AuditAction,
  entityType: EntityType,
  entityId: string | number | null,
  description: string
) {
  try {
    const session = await getSession();

    let userEmail: string | null = null;
    if (session?.userId) {
      const userResult = await pool.query(
        "SELECT email FROM fmusers WHERE user_id = $1",
        [session.userId]
      );
      userEmail = userResult.rows[0]?.email ?? null;
    }

    let ip: string | null = null;
    try {
      const headersList = await headers();
      ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
        ?? headersList.get("x-real-ip")
        ?? null;
    } catch {
      // headers() not available in some contexts — ignore
    }

    await pool.query(
      `INSERT INTO fmaudit_logs (user_id, user_email, action, entity_type, entity_id, description, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        session?.userId ?? null,
        userEmail,
        action,
        entityType,
        entityId !== null ? String(entityId) : null,
        description,
        ip,
      ]
    );
  } catch (err) {
    // Audit logging should never break the main action — just log to console
    console.error("Audit log failed:", err);
  }
}
