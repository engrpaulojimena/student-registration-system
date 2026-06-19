import { unstable_noStore as noStore } from "next/cache";
import { getAllEnrollments } from "@/lib/enrollment";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default async function Enrollments() {
  noStore();
  const enrollments = await getAllEnrollments();

  const semColors: Record<number, { bg: string; color: string; border: string }> = {
    1: { bg: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "rgba(124,58,237,0.25)" },
    2: { bg: "rgba(6,182,212,0.1)",  color: "#22D3EE", border: "rgba(6,182,212,0.25)"  },
  };

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {enrollments.length} enrollment record{enrollments.length !== 1 ? "s" : ""}
            {" · "}manage subjects from each student's detail page
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {enrollments.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                className="mx-auto mb-4" style={{ color: "var(--text-muted)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>No enrollments yet.</p>
              <Link href="/students" className="text-sm font-medium hover:opacity-80" style={{ color: "#A78BFA" }}>
                Go to Students to enroll →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["#", "Student", "Course", "School Year", "Semester", "Subjects", ""].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((row, i) => {
                    const sem = semColors[row.semester] ?? semColors[1];
                    return (
                      <tr key={row.enrollment_id} className="table-row-hover transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-6 py-4 font-mono text-xs w-12" style={{ color: "var(--text-muted)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {row.photo_url ? (
                              <img src={row.photo_url} className="w-8 h-8 rounded-lg object-cover shrink-0"
                                style={{ border: "1px solid var(--border)" }} />
                            ) : (
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid var(--border)" }}>
                                {row.student_name.split(" ").map((n: string) => n[0]).slice(0,2).join("")}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{row.student_name}</p>
                              <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{row.student_no}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                            {row.course_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                          {row.school_year}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: sem.bg, color: sem.color, border: `1px solid ${sem.border}` }}>
                            Sem {row.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {row.subject_count}
                          </span>
                          <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                            subject{row.subject_count !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/students/${row.student_id}`}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                            style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                            Manage →
                          </Link>
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
