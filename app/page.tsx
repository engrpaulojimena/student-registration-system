import { pool } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default async function Students() {
  const result = await pool.query(`
    SELECT
      s.student_no,
      s.first_name,
      s.last_name,
      c.course_code,
      s.year_level
    FROM fmstudents s
    LEFT JOIN fmcourses c ON s.course_id = c.course_id
    ORDER BY s.student_no ASC
  `);

  const yearBadge: Record<number, string> = {
    1: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    2: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    3: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    4: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      <section className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Students</h1>
            <p className="text-slate-400 mt-1">
              {result.rows.length} student{result.rows.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <Link
            href="/students/add"
            className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            + Add Student
          </Link>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {result.rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-500 text-sm">
              No students yet.{" "}
              <Link href="/students/add" className="text-blue-400 hover:underline">
                Add one now.
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-800">
                    <th className="px-6 py-3 font-medium">Student No</th>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Course</th>
                    <th className="px-6 py-3 font-medium">Year Level</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((student) => (
                    <tr
                      key={student.student_no}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition"
                    >
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {student.student_no}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {student.course_code ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${yearBadge[student.year_level] ?? "bg-slate-700 text-slate-300"}`}>
                          Year {student.year_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/students/${student.student_no}/edit`}
                            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 transition"
                          >
                            Edit
                          </Link>
                        </div>
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
