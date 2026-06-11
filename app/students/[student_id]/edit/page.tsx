import { pool } from "@/lib/db";
import { getCourses } from "@/lib/course";
import { updateStudent } from "@/lib/student";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function EditStudent({
  params,
}: {
  params: Promise<{ student_id: string }>;
}) {
  const { student_id } = await params;
  const studentId = Number(student_id);

  const studentResult = await pool.query(
    `SELECT * FROM fmstudents WHERE student_id = $1`,
    [studentId]
  );

  if (studentResult.rows.length === 0) notFound();

  const student = studentResult.rows[0];
  const courses = await getCourses();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateStudent(
      studentId,
      formData.get("firstName")  as string,
      formData.get("middleName") as string,
      formData.get("lastName")   as string,
      Number(formData.get("yearLevel")),
      Number(formData.get("courseId"))
    );
    redirect("/students");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      <section className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
            <Link href="/students" className="hover:text-slate-300 transition">Students</Link>
            <span>/</span>
            <span className="text-slate-300">Edit</span>
          </div>
          <h1 className="text-3xl font-bold">Edit Student</h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">{student.student_no}</p>
        </div>

        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8">
          <form action={handleUpdate} className="space-y-5">

            <div>
              <label className="block text-sm text-slate-400 mb-2">Student No</label>
              <input
                value={student.student_no}
                disabled
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-slate-600 text-xs mt-1">Student number cannot be changed.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  defaultValue={student.first_name}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Middle Name</label>
                <input
                  name="middleName"
                  type="text"
                  defaultValue={student.middle_name ?? ""}
                  placeholder="Optional"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  defaultValue={student.last_name}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Course</label>
                <select
                  name="courseId"
                  defaultValue={student.course_id}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                >
                  {courses.map((course: any) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_code} — {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Year Level</label>
                <select
                  name="yearLevel"
                  defaultValue={student.year_level}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 transition px-6 py-2.5 rounded-lg text-sm font-semibold"
              >
                Save Changes
              </button>
              <Link
                href="/students"
                className="bg-slate-800 hover:bg-slate-700 transition px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-300"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>

      </section>
    </main>
  );
}
