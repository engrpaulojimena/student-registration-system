import { pool } from "@/lib/db";
import Link from "next/link";

export default async function Students() {
  const result = await pool.query(`
    SELECT
      s.student_no,
      s.first_name,
      s.last_name,
      c.course_code,
      s.year_level
    FROM fmstudents s
    LEFT JOIN fmcourses c
      ON s.course_id = c.course_id
  `);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        Students
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
   <Link
  href="/students/add"
  className="bg-blue-600 px-4 py-2 rounded-lg mb-4 inline-block"
>
  Add Student
</Link>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left p-3">Student No</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">Year</th>
            </tr>
          </thead>

          <tbody>
            {result.rows.map((student) => (
              <tr
                key={student.student_no}
                className="border-b border-slate-800"
              >
                <td className="p-3">
                  {student.student_no}
                </td>

                <td className="p-3">
                  {student.first_name} {student.last_name}
                </td>

                <td className="p-3">
                  {student.course_code}
                </td>

                <td className="p-3">
                  {student.year_level}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}