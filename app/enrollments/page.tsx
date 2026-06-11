import { pool } from "@/lib/db";
import Sidebar from "@/components/Sidebar";

export default async function Enrollments() {
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

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      <section className="flex-1 p-8 overflow-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Enrollments</h1>
            <p className="text-slate-400 mt-1">{result.rows.length} enrollment record{result.rows.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {result.rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-500 text-sm">No enrollments yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-800">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium">Course</th>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">School Year</th>
                    <th className="px-6 py-3 font-medium">Sem</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{row.student_name}</div>
                        <div className="text-slate-500 text-xs font-mono">{row.student_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-xs">
                          {row.course_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{row.subject_code}</div>
                        <div className="text-slate-500 text-xs">{row.subject_name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{row.school_year}</td>
                      <td className="px-6 py-4 text-slate-400">Sem {row.semester}</td>
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
