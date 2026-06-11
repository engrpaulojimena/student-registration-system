import { pool } from "@/lib/db";
import { deleteStudent, setStudentStatus } from "@/lib/student";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { redirect } from "next/navigation";

export default async function Students() {
  const result = await pool.query(`
    SELECT
      s.student_id,
      s.student_no,
      s.first_name,
      s.middle_name,
      s.last_name,
      c.course_code,
      s.year_level,
      s.status
    FROM fmstudents s
    LEFT JOIN fmcourses c ON s.course_id = c.course_id
    ORDER BY s.student_no ASC
  `);

  // Server actions
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

  const yearBadge: Record<number, string> = {
    1: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    2: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    3: "bg-sky-500/10    text-sky-400    border-sky-500/30",
    4: "bg-teal-500/10   text-teal-400   border-teal-500/30",
  };

  const active   = result.rows.filter((s) => s.status === "active").length;
  const inactive = result.rows.filter((s) => s.status === "inactive").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      <section className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-slate-400 text-sm">{result.rows.length} total</span>
              <span className="text-slate-700">·</span>
              <span className="text-emerald-400 text-sm">{active} active</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-500 text-sm">{inactive} inactive</span>
            </div>
          </div>
          <Link
            href="/students/add"
            className="bg-indigo-600 hover:bg-indigo-700 transition px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            + Add Student
          </Link>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {result.rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-500 text-sm">
              No students yet.{" "}
              <Link href="/students/add" className="text-indigo-400 hover:underline">
                Add one now.
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-left border-b border-slate-800 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 font-medium">Student No</th>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Course</th>
                    <th className="px-6 py-3 font-medium">Year</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((student) => (
                    <tr
                      key={student.student_id}
                      className={`border-b border-slate-800/50 transition ${
                        student.status === "inactive"
                          ? "opacity-50 hover:opacity-70"
                          : "hover:bg-slate-800/20"
                      }`}
                    >
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-400">
                        {student.student_no}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-200">
                        {student.last_name}, {student.first_name}
                        {student.middle_name ? ` ${student.middle_name[0]}.` : ""}
                      </td>
                      <td className="px-6 py-3.5 text-slate-300">
                        {student.course_code ?? "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${yearBadge[student.year_level]}`}>
                          Year {student.year_level}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {student.status === "active" ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">

                          {/* Edit */}
                          <Link
                            href={`/students/${student.student_id}/edit`}
                            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                          >
                            Edit
                          </Link>

                          {/* Toggle Active/Inactive */}
                          {student.status === "active" ? (
                            <form action={handleSetInactive}>
                              <input type="hidden" name="student_id" value={student.student_id} />
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition"
                              >
                                Set Inactive
                              </button>
                            </form>
                          ) : (
                            <form action={handleSetActive}>
                              <input type="hidden" name="student_id" value={student.student_id} />
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition"
                              >
                                Set Active
                              </button>
                            </form>
                          )}

                          {/* Delete */}
                          <form action={handleDelete}>
                            <input type="hidden" name="student_id" value={student.student_id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition"
                            >
                              Delete
                            </button>
                          </form>

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
