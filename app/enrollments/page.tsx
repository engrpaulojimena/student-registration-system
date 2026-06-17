import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";
import Sidebar from "@/components/Sidebar";

export default async function Enrollments() {
  noStore();
  const result = await pool.query(`
    SELECT
      s.student_no,
      s.first_name || ' ' || s.last_name AS student_name,
      c.course_code,
      sub.subject_code,
      sub.subject_name,
      e.school_year,
      e.semester
    FROM fmenrollments e
    INNER JOIN fmstudents s ON e.student_id = s.student_id
    INNER JOIN fmsubjects sub ON e.subject_id = sub.subject_id
    INNER JOIN fmcourses c ON s.course_id = c.course_id
    ORDER BY e.school_year DESC, e.semester ASC, s.student_no ASC
  `);

  const semColors: Record<string, { bg: string; color: string; border: string }> = {
    "1": { bg: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "rgba(124,58,237,0.25)" },
    "2": { bg: "rgba(6,182,212,0.1)",  color: "#22D3EE", border: "rgba(6,182,212,0.25)"  },
  };

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {result.rows.length} enrollment record{result.rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {result.rows.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4"
                style={{ color: "var(--text-muted)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No enrollment records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["#", "Student", "Course", "Subject", "School Year", "Semester"].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => {
                    const sem = semColors[String(row.semester)] || semColors["1"];
                    return (
                      <tr key={i} className="table-row-hover transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-6 py-4 font-mono text-xs w-16" style={{ color: "var(--text-muted)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{row.student_name}</p>
                          <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{row.student_no}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                            {row.course_code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{row.subject_code}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{row.subject_name}</p>
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
