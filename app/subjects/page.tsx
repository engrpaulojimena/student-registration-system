import { unstable_noStore as noStore } from "next/cache";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "@/lib/subject";
import Sidebar from "@/components/Sidebar";
import { redirect } from "next/navigation";

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  outline: "none",
} as const;

export default async function Subjects({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string; page?: string }>;
}) {
  noStore();
  const { edit, error, page } = await searchParams;

  const subjects = await getSubjects();
  const editingSubject = edit ? subjects.find((s: any) => String(s.subject_id) === edit) : null;

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(subjects.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const paginatedSubjects = subjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (edit) sp.set("edit", edit);
    sp.set("page", String(p));
    return `/subjects?${sp.toString()}`;
  }

  const colors = [
    { bg: "rgba(124,58,237,0.1)",  color: "#A78BFA", border: "rgba(124,58,237,0.25)" },
    { bg: "rgba(6,182,212,0.1)",   color: "#22D3EE", border: "rgba(6,182,212,0.25)"  },
    { bg: "rgba(5,150,105,0.1)",   color: "#34D399", border: "rgba(5,150,105,0.25)"  },
    { bg: "rgba(217,119,6,0.1)",   color: "#FB923C", border: "rgba(217,119,6,0.25)"  },
    { bg: "rgba(239,68,68,0.1)",   color: "#F87171", border: "rgba(239,68,68,0.25)"  },
  ];

  async function handleSave(formData: FormData) {
    "use server";
    const subjectId   = formData.get("subject_id") as string;
    const subjectCode = (formData.get("subject_code") as string).trim().toUpperCase();
    const subjectName = (formData.get("subject_name") as string).trim();

    if (subjectId) {
      await updateSubject(Number(subjectId), subjectCode, subjectName);
    } else {
      await createSubject(subjectCode, subjectName);
    }
    redirect("/subjects");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    try {
      await deleteSubject(Number(formData.get("subject_id")));
    } catch (err: any) {
      redirect(`/subjects?error=${encodeURIComponent(err.message)}`);
    }
    redirect("/subjects");
  }

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {subjects.length} subject{subjects.length !== 1 ? "s" : ""} in the curriculum
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Add / Edit form */}
        <div className="rounded-2xl p-6 mb-6 gradient-border"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            {editingSubject ? "Edit Subject" : "Add New Subject"}
          </h2>
          <form action={handleSave} className="flex flex-wrap gap-3 items-end">
            {editingSubject && (
              <input type="hidden" name="subject_id" value={editingSubject.subject_id} />
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Subject Code
              </label>
              <input
                name="subject_code"
                type="text"
                placeholder="e.g. CS101"
                required
                defaultValue={editingSubject?.subject_code ?? ""}
                className="input-field rounded-xl px-4 py-2.5 text-sm w-40 font-mono uppercase"
                style={inputStyle}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Subject Name
              </label>
              <input
                name="subject_name"
                type="text"
                placeholder="e.g. Introduction to Computing"
                required
                defaultValue={editingSubject?.subject_name ?? ""}
                className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
                style={inputStyle}
              />
            </div>
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              {editingSubject ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save Changes
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Subject
                </>
              )}
            </button>
            {editingSubject && (
              <a href="/subjects"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                Cancel
              </a>
            )}
          </form>
        </div>

        {/* Subjects table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {subjects.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4"
                style={{ color: "var(--text-muted)" }}>
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No subjects yet. Add your first one above.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["#", "Subject Code", "Subject Name", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedSubjects.map((subject: any, i: number) => {
                  const c = colors[i % colors.length];
                  return (
                    <tr key={subject.subject_id} className="table-row-hover transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-6 py-4 font-mono text-xs w-16" style={{ color: "var(--text-muted)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                          {subject.subject_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: "var(--text-primary)" }}>
                        {subject.subject_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a href={`/subjects?edit=${subject.subject_id}`}
                            className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                            Edit
                          </a>
                          <form action={handleDelete}>
                            <input type="hidden" name="subject_id" value={subject.subject_id} />
                            <button type="submit"
                              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                              style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {subjects.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Page {currentPage} of {totalPages} · {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <a href={buildPageUrl(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                style={{
                  background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)",
                  opacity: currentPage === 1 ? 0.4 : 1, pointerEvents: currentPage === 1 ? "none" : "auto",
                }}>
                Prev
              </a>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a key={p} href={buildPageUrl(p)}
                  className="w-8 h-8 flex items-center justify-center text-xs rounded-lg font-medium transition-all"
                  style={{
                    background: currentPage === p ? "linear-gradient(135deg, #7C3AED, #06B6D4)" : "var(--bg-elevated)",
                    color: currentPage === p ? "#fff" : "var(--text-secondary)",
                    border: currentPage === p ? "none" : "1px solid var(--border)",
                  }}>
                  {p}
                </a>
              ))}
              <a href={buildPageUrl(Math.min(totalPages, currentPage + 1))}
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

      </section>
    </main>
  );
}