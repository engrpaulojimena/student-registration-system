import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";
import Sidebar from "@/components/Sidebar";

export default async function Courses() {
  noStore();
  const result = await pool.query(`
    SELECT course_id, course_code, course_name
    FROM fmcourses
    ORDER BY course_code ASC
  `);

  const colors = [
    { bg: "rgba(124,58,237,0.1)",  color: "#A78BFA", border: "rgba(124,58,237,0.25)" },
    { bg: "rgba(6,182,212,0.1)",   color: "#22D3EE", border: "rgba(6,182,212,0.25)"  },
    { bg: "rgba(5,150,105,0.1)",   color: "#34D399", border: "rgba(5,150,105,0.25)"  },
    { bg: "rgba(217,119,6,0.1)",   color: "#FB923C", border: "rgba(217,119,6,0.25)"  },
    { bg: "rgba(239,68,68,0.1)",   color: "#F87171", border: "rgba(239,68,68,0.25)"  },
  ];

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {result.rows.length} course{result.rows.length !== 1 ? "s" : ""} available
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {result.rows.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4"
                style={{ color: "var(--text-muted)" }}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No courses yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["#", "Course Code", "Course Name"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((course, i) => {
                  const c = colors[i % colors.length];
                  return (
                    <tr key={course.course_id} className="table-row-hover transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-6 py-4 font-mono text-xs w-16" style={{ color: "var(--text-muted)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                          {course.course_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: "var(--text-primary)" }}>
                        {course.course_name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </section>
    </main>
  );
}
