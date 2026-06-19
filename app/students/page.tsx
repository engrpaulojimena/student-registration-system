import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";
import { deleteStudent, setStudentStatus } from "@/lib/student";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { redirect } from "next/navigation";

export default async function Students() {
  noStore();

  const result = await pool.query(`
    SELECT
      s.student_id, s.student_no, s.first_name, s.middle_name, s.last_name,
      c.course_code, s.year_level, s.status, s.photo_url
    FROM fmstudents s
    LEFT JOIN fmcourses c ON s.course_id = c.course_id
    ORDER BY s.student_no ASC
  `);

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteStudent(Number(formData.get("student_id")));
    redirect("/students");
  }

  async function handleSetInactive(formData: FormData) {
    "use server";
    await setStudentStatus(Number(formData.get("student_id")), "inactive");
    redirect("/students");
  }

  async function handleSetActive(formData: FormData) {
    "use server";
    await setStudentStatus(Number(formData.get("student_id")), "active");
    redirect("/students");
  }

  const yearLabels: Record<number, { label: string; color: string; bg: string; border: string }> = {
    1: { label: "1st Year", color: "#A78BFA", bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.25)" },
    2: { label: "2nd Year", color: "#22D3EE", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)"  },
    3: { label: "3rd Year", color: "#34D399", bg: "rgba(5,150,105,0.1)",   border: "rgba(5,150,105,0.25)"  },
    4: { label: "4th Year", color: "#FB923C", bg: "rgba(217,119,6,0.1)",   border: "rgba(217,119,6,0.25)"  },
  };

  const active   = result.rows.filter((s) => s.status === "active").length;
  const inactive = result.rows.filter((s) => s.status === "inactive").length;

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{result.rows.length} total</span>
              <span style={{ color: "var(--border-bright)" }}>·</span>
              <span className="flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#34D399" }} />
                <span style={{ color: "#34D399" }}>{active} active</span>
              </span>
              <span style={{ color: "var(--border-bright)" }}>·</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{inactive} inactive</span>
            </div>
          </div>
          <Link
            href="/students/add"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Student
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {result.rows.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                className="mx-auto mb-4" style={{ color: "var(--text-muted)" }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>No students registered yet.</p>
              <Link href="/students/add" className="text-sm font-medium hover:opacity-80" style={{ color: "#A78BFA" }}>
                Add your first student →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Photo", "Student No.", "Name", "Course", "Year Level", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((student) => {
                    const yr = yearLabels[student.year_level] || yearLabels[1];
                    const fullName = `${student.first_name} ${student.last_name}`;
                    const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
                    return (
                      <tr
                        key={student.student_id}
                        className="table-row-hover transition-all"
                        style={{
                          borderBottom: "1px solid var(--border)",
                          opacity: student.status === "inactive" ? 0.45 : 1,
                        }}
                      >
                        {/* Photo */}
                        <td className="px-5 py-3">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={fullName}
                              className="w-10 h-10 rounded-xl object-cover"
                              style={{ border: "2px solid var(--border)" }}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: "linear-gradient(135deg, #7C3AED55, #06B6D455)", color: "#A78BFA", border: "2px solid var(--border)" }}
                            >
                              {initials}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          {student.student_no}
                        </td>

                        <td className="px-5 py-3">
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {student.last_name}, {student.first_name}
                            {student.middle_name ? ` ${student.middle_name[0]}.` : ""}
                          </p>
                        </td>

                        <td className="px-5 py-3">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                            {student.course_code ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: yr.bg, color: yr.color, border: `1px solid ${yr.border}` }}>
                            {yr.label}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          {student.status === "active" ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#34D399" }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-muted)" }} />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/students/${student.student_id}`}
                              className="px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors"
                              style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}
                            >
                              View
                            </Link>
                            <Link
                              href={`/students/${student.student_id}/edit`}
                              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                            >
                              Edit
                            </Link>
                            {student.status === "active" ? (
                              <form action={handleSetInactive}>
                                <input type="hidden" name="student_id" value={student.student_id} />
                                <button type="submit" className="px-3 py-1.5 text-xs rounded-lg font-medium"
                                  style={{ background: "rgba(217,119,6,0.08)", color: "#FB923C", border: "1px solid rgba(217,119,6,0.25)" }}>
                                  Deactivate
                                </button>
                              </form>
                            ) : (
                              <form action={handleSetActive}>
                                <input type="hidden" name="student_id" value={student.student_id} />
                                <button type="submit" className="px-3 py-1.5 text-xs rounded-lg font-medium"
                                  style={{ background: "rgba(5,150,105,0.08)", color: "#34D399", border: "1px solid rgba(5,150,105,0.25)" }}>
                                  Activate
                                </button>
                              </form>
                            )}
                            <form action={handleDelete}>
                              <input type="hidden" name="student_id" value={student.student_id} />
                              <button type="submit" className="px-3 py-1.5 text-xs rounded-lg font-medium"
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
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
