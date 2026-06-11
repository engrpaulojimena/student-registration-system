import { pool } from "@/lib/db";
import Sidebar from "@/components/Sidebar";

export default async function Courses() {
  const result = await pool.query(`
    SELECT course_id, course_code, course_name
    FROM fmcourses
    ORDER BY course_code ASC
  `);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      <section className="flex-1 p-8 overflow-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Courses</h1>
            <p className="text-slate-400 mt-1">{result.rows.length} course{result.rows.length !== 1 ? "s" : ""} available</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {result.rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-500 text-sm">No courses yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-800">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Course Code</th>
                  <th className="px-6 py-3 font-medium">Course Name</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((course, i) => (
                  <tr key={course.course_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-mono">
                        {course.course_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{course.course_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </section>
    </main>
  );
}
