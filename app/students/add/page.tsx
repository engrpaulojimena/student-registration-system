import { getCourses } from "@/lib/course";
import { createStudent, generateStudentNo } from "@/lib/student";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";

export default async function AddStudent() {
  const courses      = await getCourses();
  const generatedNo  = await generateStudentNo();

  async function saveStudent(formData: FormData) {
    "use server";
    await createStudent(
      formData.get("studentNo")  as string,
      formData.get("firstName")  as string,
      formData.get("middleName") as string,
      formData.get("lastName")   as string,
      Number(formData.get("yearLevel")),
      Number(formData.get("courseId"))
    );

    const result = await pool.query(
      "SELECT student_id FROM fmstudents WHERE student_no = $1",
      [formData.get("studentNo")]
    );
    const newId = result.rows[0]?.student_id;
    redirect(newId ? `/students/${newId}/edit` : "/students");
  }

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
            <span style={{ color: "var(--text-secondary)" }}>Add Student</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Add Student</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Student number is auto-generated. You can edit it if needed.
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="rounded-2xl p-8 gradient-border"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

            <form action={saveStudent} className="space-y-6">

              {/* Student No — auto-generated but editable */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-secondary)" }}>
                  Student Number
                </label>
                <div className="relative">
                  <input
                    name="studentNo"
                    type="text"
                    defaultValue={generatedNo}
                    required
                    className="input-field w-full rounded-xl px-4 py-3 pr-28 text-sm font-mono transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-md pointer-events-none"
                    style={{ background: "rgba(6,182,212,0.1)", color: "#22D3EE", border: "1px solid rgba(6,182,212,0.2)" }}
                  >
                    Auto-generated
                  </span>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Format: STU-YEAR-SEQ · You can override this manually.
                </p>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "firstName",  label: "First Name",  placeholder: "Juan",      required: true  },
                  { name: "middleName", label: "Middle Name", placeholder: "Optional",  required: false },
                  { name: "lastName",   label: "Last Name",   placeholder: "Dela Cruz", required: true  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-secondary)" }}>
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type="text"
                      placeholder={field.placeholder}
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

              {/* Course + Year Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-secondary)" }}>
                    Course
                  </label>
                  <select
                    name="courseId"
                    required
                    className="input-field w-full rounded-xl px-4 py-3 text-sm transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  >
                    <option value="">Select course…</option>
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
                  Save &amp; Add Photo
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