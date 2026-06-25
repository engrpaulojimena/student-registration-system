import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function AuditLogs({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string; page?: string; user?: string }>;
}) {
  noStore();

  const allowed = await isSuperAdmin();
  if (!allowed) notFound();

  const { action, entity, page, user } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 30;
  const offset = (currentPage - 1) * pageSize;

  const conditions: string[] = [];
  const values: any[] = [];

  if (action) {
    values.push(action);
    conditions.push(`action = $${values.length}`);
  }
  if (entity) {
    values.push(entity);
    conditions.push(`entity_type = $${values.length}`);
  }
  if (user) {
    values.push(`%${user}%`);
    conditions.push(`user_email ILIKE $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(`SELECT COUNT(*) FROM fmaudit_logs ${whereClause}`, values);
  const totalCount = Number(countResult.rows[0].count);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  values.push(pageSize, offset);
  const logsResult = await pool.query(
    `SELECT * FROM fmaudit_logs ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  const distinctUsersResult = await pool.query(`
    SELECT DISTINCT user_email FROM fmaudit_logs
    WHERE user_email IS NOT NULL
    ORDER BY user_email ASC
  `);

  const actionBadge: Record<string, { bg: string; color: string }> = {
    CREATE:  { bg: "rgba(16,185,129,0.1)",  color: "#34d399" },
    UPDATE:  { bg: "rgba(99,102,241,0.1)",  color: "#818cf8" },
    DELETE:  { bg: "rgba(239,68,68,0.1)",   color: "#f87171" },
    LOGIN:   { bg: "rgba(6,182,212,0.1)",   color: "#22d3ee" },
    APPROVE: { bg: "rgba(16,185,129,0.1)",  color: "#34d399" },
    REJECT:  { bg: "rgba(239,68,68,0.1)",   color: "#f87171" },
  };

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    if (params.action) sp.set("action", params.action);
    if (params.entity) sp.set("entity", params.entity);
    if (params.user)   sp.set("user", params.user);
    if (params.page)   sp.set("page", params.page);
    const qs = sp.toString();
    return `/audit-logs${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {totalCount} log entr{totalCount !== 1 ? "ies" : "y"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <a href={buildUrl({ entity, user })}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
          style={{
            background: !action ? "var(--accent-light, rgba(124,58,237,0.15))" : "var(--bg-glass)",
            color: !action ? "#a78bfa" : "var(--text-secondary)",
            border: `1px solid ${!action ? "rgba(124,58,237,0.3)" : "var(--border-glass)"}`,
          }}>
          All Actions
        </a>
        {["CREATE", "UPDATE", "DELETE", "LOGIN", "APPROVE", "REJECT"].map((a) => (
          <a key={a} href={buildUrl({ action: a, entity, user })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={{
              background: action === a ? "var(--accent-light, rgba(124,58,237,0.15))" : "var(--bg-glass)",
              color: action === a ? "#a78bfa" : "var(--text-secondary)",
              border: `1px solid ${action === a ? "rgba(124,58,237,0.3)" : "var(--border-glass)"}`,
            }}>
            {a}
          </a>
        ))}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <a href={buildUrl({ action, user })}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
          style={{
            background: !entity ? "var(--accent-light, rgba(124,58,237,0.15))" : "var(--bg-glass)",
            color: !entity ? "#a78bfa" : "var(--text-secondary)",
            border: `1px solid ${!entity ? "rgba(124,58,237,0.3)" : "var(--border-glass)"}`,
          }}>
          All Entities
        </a>
        {["student", "course", "subject", "enrollment", "user"].map((e) => (
          <a key={e} href={buildUrl({ action, entity: e, user })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize"
            style={{
              background: entity === e ? "var(--accent-light, rgba(124,58,237,0.15))" : "var(--bg-glass)",
              color: entity === e ? "#a78bfa" : "var(--text-secondary)",
              border: `1px solid ${entity === e ? "rgba(124,58,237,0.3)" : "var(--border-glass)"}`,
            }}>
            {e}
          </a>
        ))}
      </div>

      {/* Search by user */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <form method="GET" className="flex items-center gap-2">
          {action && <input type="hidden" name="action" value={action} />}
          {entity && <input type="hidden" name="entity" value={entity} />}
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              name="user"
              defaultValue={user ?? ""}
              placeholder="Search by user email…"
              list="audit-user-options"
              className="text-xs rounded-lg pl-8 pr-3 py-2 w-64"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <datalist id="audit-user-options">
              {distinctUsersResult.rows.map((row) => (
                <option key={row.user_email} value={row.user_email} />
              ))}
            </datalist>
          </div>
          <button type="submit"
            className="px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", color: "#fff" }}>
            Search
          </button>
          {user && (
            <a href={buildUrl({ action, entity })}
              className="px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-glass)", color: "var(--text-secondary)", border: "1px solid var(--border-glass)" }}>
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Log table */}
      <div className="glass overflow-hidden">
        {logsResult.rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-muted)" }}>
                  <th className="px-6 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-6 py-3 text-left font-medium">User</th>
                  <th className="px-6 py-3 text-left font-medium">Action</th>
                  <th className="px-6 py-3 text-left font-medium">Entity</th>
                  <th className="px-6 py-3 text-left font-medium">Description</th>
                  <th className="px-6 py-3 text-left font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logsResult.rows.map((log) => {
                  const ab = actionBadge[log.action] ?? { bg: "rgba(100,116,139,0.1)", color: "#94a3b8" };
                  return (
                    <tr key={log.log_id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                      <td className="px-6 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                        {new Date(log.created_at).toLocaleString("en-PH", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {log.user_email ?? "System"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: ab.bg, color: ab.color }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                        {log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ""}
                      </td>
                      <td className="px-6 py-3.5 text-sm" style={{ color: "var(--text-primary)" }}>
                        {log.description}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {log.ip_address ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {currentPage > 1 && (
            <a href={buildUrl({ action, entity, user, page: String(currentPage - 1) })}
              className="px-3 py-1.5 rounded-lg text-xs glass" style={{ color: "var(--text-secondary)" }}>
              ← Previous
            </a>
          )}
          <span className="text-xs px-3" style={{ color: "var(--text-muted)" }}>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a href={buildUrl({ action, entity, user, page: String(currentPage + 1) })}
              className="px-3 py-1.5 rounded-lg text-xs glass" style={{ color: "var(--text-secondary)" }}>
              Next →
            </a>
          )}
        </div>
      )}
      </section>
    </main>
  );
}
