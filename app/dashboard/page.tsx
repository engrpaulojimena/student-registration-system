import { pool } from "@/lib/db";
import Sidebar from "@/components/Sidebar";

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

  const stats = [
    { label: "Total Students",    count: studentsCount.rows[0].count,    icon: "◎",  color: "indigo"  },
    { label: "Courses Offered",   count: coursesCount.rows[0].count,     icon: "▦",  color: "violet"  },
    { label: "Subjects",          count: subjectsCount.rows[0].count,    icon: "≡",  color: "sky"     },
    { label: "Enrollments",       count: enrollmentsCount.rows[0].count, icon: "✓",  color: "teal"    },
  ];

  const colorMap: Record<string, { card: string; icon: string; num: string }> = {
    indigo: { card: "border-indigo-500/20 bg-indigo-500/5",  icon: "bg-indigo-500/15 text-indigo-400", num: "text-indigo-300" },
    violet: { card: "border-violet-500/20 bg-violet-500/5",  icon: "bg-violet-500/15 text-violet-400", num: "text-violet-300" },
    sky:    { card: "border-sky-500/20    bg-sky-500/5",     icon: "bg-sky-500/15    text-sky-400",    num: "text-sky-300"    },
    teal:   { card: "border-teal-500/20   bg-teal-500/5",    icon: "bg-teal-500/15   text-teal-400",   num: "text-teal-300"   },
  };

  const quickActions = [
    { href: "/students/add", icon: "+", label: "Add Student",    desc: "Register a new student",      color: "indigo" },
    { href: "/courses",      icon: "▦", label: "Manage Courses", desc: "View and update courses",     color: "violet" },
    { href: "/enrollments",  icon: "✓", label: "Enrollments",    desc: "View all enrollment records", color: "teal"   },
  ];

  const qaColorMap: Record<string, string> = {
    indigo: "hover:border-indigo-500/40 hover:bg-indigo-500/5",
    violet: "hover:border-violet-500/40 hover:bg-violet-500/5",
    teal:   "hover:border-teal-500/40   hover:bg-teal-500/5",
  };

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      <section className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-slate-500 text-sm mb-1">{today}</p>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-xs">System Online</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const c = colorMap[stat.color];
            return (
              <div key={stat.label} className={`border ${c.card} rounded-xl p-5`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-lg ${c.icon} flex items-center justify-center text-lg font-bold`}>
                    {stat.icon}
                  </div>
                </div>
                <p className={`text-3xl font-bold ${c.num}`}>{stat.count}</p>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className={`bg-slate-900 border border-slate-800 rounded-xl p-5 transition-all duration-200 ${qaColorMap[action.color]} group`}
            >
              <p className="text-base font-semibold text-white mb-1">{action.label}</p>
              <p className="text-slate-500 text-sm">{action.desc}</p>
            </a>
          ))}
        </div>

        {/* Recent Enrollments */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-white text-sm">Recent Enrollments</h2>
              <p className="text-slate-500 text-xs mt-0.5">Latest 5 enrollment records</p>
            </div>
            <a href="/enrollments" className="text-xs text-indigo-400 hover:text-indigo-300 transition border border-indigo-500/20 px-3 py-1.5 rounded-lg">
              View all →
            </a>
          </div>

          {recentEnrollments.rows.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">
              No enrollment records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-left border-b border-slate-800/60 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Course</th>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">School Year</th>
                    <th className="px-6 py-3 font-medium">Sem</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.rows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition">
                      <td className="px-6 py-3.5 text-slate-600 text-xs">{i + 1}</td>
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-200 text-sm">{row.student_name}</p>
                        <p className="text-slate-600 text-xs font-mono">{row.student_no}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-xs font-mono">
                          {row.course_code}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-slate-300 text-sm">{row.subject_code}</p>
                        <p className="text-slate-600 text-xs">{row.subject_name}</p>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400 text-sm">{row.school_year}</td>
                      <td className="px-6 py-3.5 text-slate-400 text-sm">Sem {row.semester}</td>
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
