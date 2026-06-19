import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function UserManagement({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  noStore();
  const { page } = await searchParams;

  const allowed = await isSuperAdmin();
  if (!allowed) notFound();

  const result = await pool.query(`
    SELECT user_id, email, full_name, role, status, created_at, approved_at
    FROM fmusers
    ORDER BY
      CASE status WHEN 'pending' THEN 0 ELSE 1 END,
      created_at DESC
  `);

  async function handleApprove(formData: FormData) {
    "use server";
    const userId = Number(formData.get("user_id"));
    const email  = formData.get("email") as string;
    await pool.query(
      "UPDATE fmusers SET status = 'active', approved_at = NOW() WHERE user_id = $1",
      [userId]
    );
    await logAction("APPROVE", "user", userId, `Approved user account: ${email}`);
    redirect("/users");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const userId = Number(formData.get("user_id"));
    const email  = formData.get("email") as string;
    await pool.query("UPDATE fmusers SET status = 'rejected' WHERE user_id = $1", [userId]);
    await logAction("REJECT", "user", userId, `Rejected user account: ${email}`);
    redirect("/users");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const userId = Number(formData.get("user_id"));
    const email  = formData.get("email") as string;
    await pool.query("DELETE FROM fmusers WHERE user_id = $1", [userId]);
    await logAction("DELETE", "user", userId, `Deleted user account: ${email}`);
    redirect("/users");
  }

  const pending = result.rows.filter(u => u.status === "pending");
  const others  = result.rows.filter(u => u.status !== "pending");

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(others.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const paginatedOthers = others.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const roleBadge: Record<string, { bg: string; color: string; border: string }> = {
    super_admin: { bg: "rgba(239,68,68,0.1)",  color: "#f87171", border: "rgba(239,68,68,0.3)"  },
    user:        { bg: "rgba(100,116,139,0.1)",color: "#94a3b8", border: "rgba(100,116,139,0.3)"},
  };

  const statusBadge: Record<string, { bg: string; color: string; border: string }> = {
    active:   { bg: "rgba(16,185,129,0.1)",  color: "#34d399", border: "rgba(16,185,129,0.3)"  },
    pending:  { bg: "rgba(245,158,11,0.1)",  color: "#fbbf24", border: "rgba(245,158,11,0.3)"  },
    rejected: { bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.3)"   },
  };

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {result.rows.length} total user{result.rows.length !== 1 ? "s" : ""}
          {pending.length > 0 && (
            <span style={{ color: "#fbbf24" }}> · {pending.length} pending approval</span>
          )}
        </p>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Pending Requests</h2>
          <div className="glass overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-muted)" }}>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Requested</th>
                  <th className="px-6 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.user_id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                    <td className="px-6 py-3.5 font-medium">{u.full_name}</td>
                    <td className="px-6 py-3.5" style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(u.created_at).toLocaleDateString("en-PH")}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex gap-2">
                        <form action={handleApprove}>
                          <input type="hidden" name="user_id" value={u.user_id} />
                          <input type="hidden" name="email" value={u.email} />
                          <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                            Approve
                          </button>
                        </form>
                        <form action={handleReject}>
                          <input type="hidden" name="user_id" value={u.user_id} />
                          <input type="hidden" name="email" value={u.email} />
                          <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                            Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All users */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>All Users</h2>
        <div className="glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-muted)" }}>
                <th className="px-6 py-3 text-left font-medium">Name</th>
                <th className="px-6 py-3 text-left font-medium">Email</th>
                <th className="px-6 py-3 text-left font-medium">Role</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOthers.map((u) => {
                const rb = roleBadge[u.role] ?? roleBadge.user;
                const sb = statusBadge[u.status] ?? statusBadge.active;
                return (
                  <tr key={u.user_id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                    <td className="px-6 py-3.5 font-medium">{u.full_name}</td>
                    <td className="px-6 py-3.5" style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: rb.bg, color: rb.color, border: `1px solid ${rb.border}` }}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: sb.bg, color: sb.color, border: `1px solid ${sb.border}` }}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex gap-2 flex-wrap items-center">
                        {u.role !== "super_admin" && (
                          <form action={handleDelete}>
                            <input type="hidden" name="user_id" value={u.user_id} />
                            <input type="hidden" name="email" value={u.email} />
                            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {others.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Page {currentPage} of {totalPages} · {others.length} user{others.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <a href={`/users?page=${Math.max(1, currentPage - 1)}`}
                aria-disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                style={{
                  background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)",
                  opacity: currentPage === 1 ? 0.4 : 1, pointerEvents: currentPage === 1 ? "none" : "auto",
                }}>
                Prev
              </a>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a key={p} href={`/users?page=${p}`}
                  className="w-8 h-8 flex items-center justify-center text-xs rounded-lg font-medium transition-all"
                  style={{
                    background: currentPage === p ? "linear-gradient(135deg, #7C3AED, #06B6D4)" : "var(--bg-elevated)",
                    color: currentPage === p ? "#fff" : "var(--text-secondary)",
                    border: currentPage === p ? "none" : "1px solid var(--border)",
                  }}>
                  {p}
                </a>
              ))}
              <a href={`/users?page=${Math.min(totalPages, currentPage + 1)}`}
                aria-disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                style={{
                  background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)",
                  opacity: currentPage === totalPages ? 0.4 : 1, pointerEvents: currentPage === totalPages ? "none" : "auto",
                }}>
                Next
              </a>
            </div>
          </div>
        )}
      </div>
      </section>
    </main>
  );
}
