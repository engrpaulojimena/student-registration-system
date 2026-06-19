import { pool } from "@/lib/db";
import {
  getEnrollmentsByStudent,
  getSubjectsByEnrollment,
  createEnrollment,
  deleteEnrollment,
  addSubjectToEnrollment,
  removeSubjectFromEnrollment,
} from "@/lib/enrollment";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  outline: "none",
} as const;

const semColors: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "rgba(124,58,237,0.3)" },
  2: { bg: "rgba(6,182,212,0.1)",  color: "#22D3EE", border: "rgba(6,182,212,0.3)"  },
};

const yearLabels: Record<number, string> = {
  1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year",
};

export default async function StudentDetail({
  params,
}: {
  params: Promise<{ student_id: string }>;
}) {
  const { student_id } = await params;
  const studentId = Number(student_id);

  const studentResult = await pool.query(
    `SELECT s.*, c.course_code, c.course_name
     FROM fmstudents s
     LEFT JOIN fmcourses c ON c.course_id = s.course_id
     WHERE s.student_id = $1`,
    [studentId]
  );
  if (studentResult.rows.length === 0) notFound();
  const student = studentResult.rows[0];

  const enrollments = await getEnrollmentsByStudent(studentId);

  // Fetch subjects for every enrollment
  const enrollmentsWithSubjects = await Promise.all(
    enrollments.map(async (e) => ({
      ...e,
      subjects: await getSubjectsByEnrollment(e.enrollment_id),
    }))
  );

  const allSubjects = await pool.query(
    `SELECT subject_id, subject_code, subject_name FROM fmsubjects ORDER BY subject_code ASC`
  );

  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
  const fullName = `${student.first_name}${student.middle_name ? " " + student.middle_name : ""} ${student.last_name}`;

  // ── Server Actions ─────────────────────────────────────────

  async function handleAddEnrollment(formData: FormData) {
    "use server";
    const schoolYear = formData.get("school_year") as string;
    const semester   = Number(formData.get("semester"));
    try {
      await createEnrollment(studentId, schoolYear, semester);
    } catch (_) {}
    redirect(`/students/${studentId}`);
  }

  async function handleDeleteEnrollment(formData: FormData) {
    "use server";
    await deleteEnrollment(Number(formData.get("enrollment_id")));
    redirect(`/students/${studentId}`);
  }

  async function handleAddSubject(formData: FormData) {
    "use server";
    const enrollmentId = Number(formData.get("enrollment_id"));
    const subjectId    = Number(formData.get("subject_id"));
    try {
      await addSubjectToEnrollment(enrollmentId, subjectId);
    } catch (_) {}
    redirect(`/students/${studentId}`);
  }

  async function handleRemoveSubject(formData: FormData) {
    "use server";
    await removeSubjectFromEnrollment(Number(formData.get("enrollment_subject_id")));
    redirect(`/students/${studentId}`);
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/students" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>
            Students
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ color: "var(--text-secondary)" }}>{student.last_name}, {student.first_name}</span>
        </div>

        {/* ── Profile Card ── */}
        <div className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

          {/* Avatar */}
          <div className="shrink-0">
            {student.photo_url ? (
              <img src={student.photo_url} alt={fullName}
                className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: "3px solid var(--border)" }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: "linear-gradient(135deg, #7C3AED33, #06B6D433)", color: "#A78BFA", border: "3px solid var(--border)" }}>
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              {student.status === "active" ? (
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(5,150,105,0.1)", color: "#34D399", border: "1px solid rgba(5,150,105,0.25)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-muted)" }} />
                  Inactive
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
                <span className="font-mono">{student.student_no}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md font-medium"
                  style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA" }}>
                  {student.course_code}
                </span>
                <span>{student.course_name}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                {yearLabels[student.year_level] ?? `Year ${student.year_level}`}
              </span>
            </div>
          </div>

          {/* Edit button */}
          <Link href={`/students/${studentId}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shrink-0 transition-opacity hover:opacity-80"
            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </Link>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Semesters Enrolled",
              value: enrollments.length,
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
              color: "#A78BFA",
            },
            {
              label: "Total Subjects",
              value: enrollmentsWithSubjects.reduce((s, e) => s + e.subjects.length, 0),
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
              color: "#22D3EE",
            },
            {
              label: "Latest Semester",
              value: enrollments.length > 0 ? `Sem ${enrollments[0].semester} ${enrollments[0].school_year}` : "—",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              color: "#34D399",
              text: true,
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: stat.color + "15", color: stat.color }}>
                {stat.icon}
              </div>
              <p className={`font-bold ${stat.text ? "text-base" : "text-2xl"}`} style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Add Enrollment Form ── */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Add New Enrollment
          </h2>
          <form action={handleAddEnrollment} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                School Year
              </label>
              <input
                name="school_year"
                type="text"
                placeholder="e.g. 2025-2026"
                required
                pattern="\d{4}-\d{4}"
                className="input-field rounded-xl px-4 py-2.5 text-sm w-40"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Semester
              </label>
              <select name="semester" className="input-field rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Enrollment
            </button>
          </form>
        </div>

        {/* ── Enrollment Records ── */}
        <div className="space-y-4">
          {enrollmentsWithSubjects.length === 0 ? (
            <div className="rounded-2xl px-6 py-16 text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No enrollments yet. Add one above.</p>
            </div>
          ) : (
            enrollmentsWithSubjects.map((enrollment) => {
              const sem = semColors[enrollment.semester] ?? semColors[1];
              // Subjects already enrolled — filter selectable ones
              const enrolledSubjectIds = new Set(enrollment.subjects.map((s: any) => s.subject_id));
              const availableSubjects = allSubjects.rows.filter((s: any) => !enrolledSubjectIds.has(s.subject_id));

              return (
                <div key={enrollment.enrollment_id} className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--bg-card)", border: `1px solid ${sem.border}` }}>

                  {/* Enrollment header */}
                  <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid var(--border)", background: sem.bg }}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold px-3 py-1 rounded-lg"
                        style={{ background: sem.bg, color: sem.color, border: `1px solid ${sem.border}` }}>
                        Semester {enrollment.semester}
                      </span>
                      <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {enrollment.school_year}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                        {enrollment.subjects.length} subject{enrollment.subjects.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <form action={handleDeleteEnrollment}>
                      <input type="hidden" name="enrollment_id" value={enrollment.enrollment_id} />
                      <button type="submit"
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
                        style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                        Remove
                      </button>
                    </form>
                  </div>

                  {/* Subjects list */}
                  <div className="px-6 py-4">
                    {enrollment.subjects.length === 0 ? (
                      <p className="text-sm py-2" style={{ color: "var(--text-muted)" }}>
                        No subjects yet — add one below.
                      </p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {enrollment.subjects.map((subject: any, idx: number) => (
                          <div key={subject.enrollment_subject_id}
                            className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-medium w-5 text-center"
                                style={{ color: "var(--text-muted)" }}>
                                {idx + 1}
                              </span>
                              <span className="font-mono text-xs px-2.5 py-1 rounded-lg font-semibold"
                                style={{ background: sem.bg, color: sem.color, border: `1px solid ${sem.border}` }}>
                                {subject.subject_code}
                              </span>
                              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                {subject.subject_name}
                              </span>
                            </div>
                            <form action={handleRemoveSubject}>
                              <input type="hidden" name="enrollment_subject_id" value={subject.enrollment_subject_id} />
                              <button type="submit"
                                className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                                style={{ color: "var(--text-muted)" }}
                                title="Remove subject">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add subject form */}
                    {availableSubjects.length > 0 && (
                      <form action={handleAddSubject} className="flex gap-2 items-center">
                        <input type="hidden" name="enrollment_id" value={enrollment.enrollment_id} />
                        <select name="subject_id" required
                          className="input-field flex-1 rounded-xl px-3 py-2 text-sm"
                          style={inputStyle}>
                          <option value="">Select subject to add…</option>
                          {availableSubjects.map((sub: any) => (
                            <option key={sub.subject_id} value={sub.subject_id}>
                              {sub.subject_code} — {sub.subject_name}
                            </option>
                          ))}
                        </select>
                        <button type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
                          style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Add
                        </button>
                      </form>
                    )}
                    {availableSubjects.length === 0 && enrollment.subjects.length > 0 && (
                      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                        ✓ All available subjects added.
                      </p>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </section>
    </main>
  );
}
