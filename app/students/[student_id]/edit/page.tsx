import { pool } from "@/lib/db";
import { getCourses } from "@/lib/course";
import { updateStudent } from "@/lib/student";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import PhotoUploader from "@/components/PhotoUploader";

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

  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link href="/students" className="transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
              Students
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--text-muted)" }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span style={{ color: "var(--text-secondary)" }}>Edit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
          <p className="font-mono text-sm mt-1" style={{ color: "var(--text-muted)" }}>{student.student_no}</p>
        </div>

        <div className="max-w-2xl space-y-6">

          {/* Photo Card */}
          <div className="rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
              STUDENT PHOTO
            </h2>
            <PhotoUploader
              studentId={studentId}
              currentPhotoUrl={student.photo_url ?? null}
              initials={initials}
            />
          </div>

          {/* Info Card */}
          <div className="rounded-2xl p-8 gradient-border"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

            <form action={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-secondary)" }}>
                  Student Number
                </label>
                <input
                  value={student.student_no}
                  disabled
                  className="w-full rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    outline: "none",
                  }}
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Student number cannot be changed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "firstName",  label: "First Name",  def: student.first_name,        required: true  },
                  { name: "middleName", label: "Middle Name", def: student.middle_name ?? "",  required: false },
                  { name: "lastName",   label: "Last Name",   def: student.last_name,          required: true  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-secondary)" }}>
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type="text"
                      defaultValue={field.def}
                      required={field.required}
                      className="input-field w-full rounded-xl px-4 py-3 text-sm transition-all"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-secondary)" }}>
                    Course
                  </label>
                  <select
                    name="courseId"
                    defaultValue={student.course_id}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  >
                    {courses.map((course: any) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_code} — {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-secondary)" }}>
                    Year Level
                  </label>
                  <select
                    name="yearLevel"
                    defaultValue={student.year_level}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save Changes
                </button>
                <Link
                  href="/students"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  Cancel
                </Link>
              </div>
            </form>

          </div>
        </div>

      </section>
    </main>
  );
}
