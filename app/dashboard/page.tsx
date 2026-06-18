import { pool } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import StudentsPerCourse from "@/components/charts/StudentsPerCourse";

export default async function Dashboard() {
  const studentsCount    = await pool.query("SELECT COUNT(*) FROM fmstudents");
  const coursesCount     = await pool.query("SELECT COUNT(*) FROM fmcourses");
  const subjectsCount    = await pool.query("SELECT COUNT(*) FROM fmsubjects");
  const enrollmentsCount = await pool.query("SELECT COUNT(*) FROM fmenrollments");

  const recentEnrollments = await pool.query(`
    SELECT
      s.student_no,
      s.first_name || ' ' || s.last_name AS student_name,
      c.course_code,
      sub.subject_code,
      sub.subject_name,
      e.school_year,
      e.semester
    FROM fmenrollments e
    INNER JOIN fmstudents s   ON e.student_id  = s.student_id
    INNER JOIN fmsubjects sub ON e.subject_id  = sub.subject_id
    INNER JOIN fmcourses c    ON s.course_id   = c.course_id
    ORDER BY e.school_year DESC, e.semester DESC
    LIMIT 5
  `);

  const studentsPerCourse = await pool.query(`
  SELECT
    c.course_code,
    COUNT(*) as total
  FROM fmstudents s
  INNER JOIN fmcourses c
    ON s.course_id = c.course_id
  GROUP BY c.course_code
  ORDER BY total DESC
`);

  const stats = [
    {
      label: "Total Students",
      count: studentsCount.rows[0].count,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      gradient: "linear-gradient(135deg, #7C3AED22, #7C3AED08)",
      iconColor: "#A78BFA",
      numColor: "#C4B5FD",
      borderColor: "rgba(124,58,237,0.2)",
    },
    {
      label: "Courses Offered",
      count: coursesCount.rows[0].count,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      gradient: "linear-gradient(135deg, #0891B222, #0891B208)",
      iconColor: "#22D3EE",
      numColor: "#67E8F9",
      borderColor: "rgba(6,182,212,0.2)",
    },
    {
      label: "Subjects",
      count: subjectsCount.rows[0].count,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ),
      gradient: "linear-gradient(135deg, #059669" + "22, #059669" + "08)",
      iconColor: "#34D399",
      numColor: "#6EE7B7",
      borderColor: "rgba(5,150,105,0.2)",
    },
    {
      label: "Enrollments",
      count: enrollmentsCount.rows[0].count,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      gradient: "linear-gradient(135deg, #D9770622, #D9770608)",
      iconColor: "#FB923C",
      numColor: "#FDBA74",
      borderColor: "rgba(217,119,6,0.2)",
    },
  ];



  const quickActions = [
    {
      href: "/students/add",
      label: "Add Student",
      desc: "Register a new student record",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      ),
      color: "#A78BFA",
    },
    {
      href: "/courses",
      label: "Manage Courses",
      desc: "View and update courses",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      color: "#22D3EE",
    },
    {
      href: "/enrollments",
      label: "Enrollments",
      desc: "Browse all enrollment records",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
      color: "#34D399",
    },
  ];

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              {today}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Welcome back, Administrator
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <span className="relative flex w-2 h-2">
              <span className="pulse-dot relative w-2 h-2 rounded-full" style={{ background: "#34D399" }} />
            </span>
            <span className="text-xs font-medium" style={{ color: "#34D399" }}>System Online</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card rounded-2xl p-5 transition-all"
              style={{
                background: stat.gradient,
                border: `1px solid ${stat.borderColor}`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.05)", color: stat.iconColor }}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: stat.numColor }}>
                {stat.count}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mb-6">
          <StudentsPerCourse
            data={studentsPerCourse.rows.map((row) => ({
              course_code: row.course_code,
              total: Number(row.total),
            }))}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="quick-action-card rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: action.color + "15", color: action.color }}>
                {action.icon}
              </div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{action.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{action.desc}</p>
            </a>
          ))}
        </div>

        {/* Recent Enrollments */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4 flex justify-between items-center"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Recent Enrollments</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Last 5 enrollment records</p>
            </div>
            <a href="/enrollments"
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "#A78BFA", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              View all →
            </a>
          </div>

          {recentEnrollments.rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3"
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
                    {["#", "Student", "Course", "Subject", "School Year", "Sem"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.rows.map((row, i) => (
                    <tr key={i} className="table-row-hover transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-6 py-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{row.student_name}</p>
                        <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{row.student_no}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                          {row.course_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.subject_code}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{row.subject_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{row.school_year}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                          Sem {row.semester}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
