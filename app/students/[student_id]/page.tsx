import { pool } from "@/lib/db";
import {
  getEnrollmentsByStudent,
  getSubjectsByEnrollment,
  createEnrollment,
  deleteEnrollment,
  addSubjectToEnrollment,
  removeSubjectFromEnrollment,
} from "@/lib/enrollment";
import { getGradesByStudent } from "@/lib/grade";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import GradeCell from "./GradeCell";
import RemarksSelect from "./RemarksSelect";
import ExportButton from "./ExportButton";

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

const remarksColors: Record<string, { bg: string; color: string; border: string }> = {
  "Passed":      { bg: "rgba(16,185,129,0.1)",  color: "#34D399", border: "rgba(16,185,129,0.3)"  },
  "Failed":      { bg: "rgba(239,68,68,0.1)",   color: "#F87171", border: "rgba(239,68,68,0.3)"   },
  "Incomplete":  { bg: "rgba(245,158,11,0.1)",  color: "#FBBF24", border: "rgba(245,158,11,0.3)"  },
  "Dropped":     { bg: "rgba(107,114,128,0.1)", color: "#9CA3AF", border: "rgba(107,114,128,0.3)" },
  "In Progress": { bg: "rgba(99,102,241,0.1)",  color: "#818CF8", border: "rgba(99,102,241,0.3)"  },
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
  const grades = await getGradesByStudent(studentId);

  // Map grades by enrollment_subject_id for fast lookup
  const gradeMap = new Map(grades.map((g) => [g.enrollment_subject_id, g]));

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

  async function handleAddEnrollment(formData: FormData) {
    "use server";
    const schoolYear = formData.get("school_year") as string;
    const semester   = Number(formData.get("semester"));
    try { await createEnrollment(studentId, schoolYear, semester); } catch (_) {}
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
    try { await addSubjectToEnrollment(enrollmentId, subjectId); } catch (_) {}
    redirect(`/students/${studentId}`);
  }

  async function handleRemoveSubject(formData: FormData) {
    "use server";
    await removeSubjectFromEnrollment(Number(formData.get("enrollment_subject_id")));
    redirect(`/students/${studentId}`);
  }

  // Build export data
  const exportData = enrollmentsWithSubjects.flatMap((e) =>
    e.subjects.map((sub: any) => {
      const g = gradeMap.get(sub.enrollment_subject_id);
      return {
        school_year:    e.school_year,
        semester:       e.semester,
        subject_code:   sub.subject_code,
        subject_name:   sub.subject_name,
        prelim_grade:   g?.prelim_grade ?? "",
        midterm_grade:  g?.midterm_grade ?? "",
        final_grade:    g?.final_grade ?? "",
        remarks:        g?.remarks ?? "In Progress",
      };
    })
  );

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/students" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>Students</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ color: "var(--text-secondary)" }}>{student.last_name}, {student.first_name}</span>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="shrink-0">
            {student.photo_url ? (
              <img src={student.photo_url} alt={fullName} className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: "3px solid var(--border)" }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: "linear-gradient(135deg, #7C3AED33, #06B6D433)", color: "#A78BFA", border: "3px solid var(--border)" }}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={student.status === "active"
                  ? { background: "rgba(5,150,105,0.1)", color: "#34D399", border: "1px solid rgba(5,150,105,0.25)" }
                  : { background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: student.status === "active" ? "#34D399" : "var(--text-muted)" }} />
                {student.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
              <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{student.student_no}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA" }}>{student.course_code}</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{student.course_name}</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{yearLabels[student.year_level]}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/students/${studentId}/print`} target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </Link>
            <ExportButton student={student} data={exportData} />
            <Link href={`/students/${studentId}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Semesters",      value: enrollments.length,                                                               color: "#A78BFA" },
            { label: "Total Subjects", value: enrollmentsWithSubjects.reduce((s, e) => s + e.subjects.length, 0),              color: "#22D3EE" },
            { label: "Passed",         value: grades.filter(g => g.remarks === "Passed").length,                               color: "#34D399" },
            { label: "In Progress",    value: grades.filter(g => g.remarks === "In Progress" || !g.remarks).length,            color: "#FBBF24" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Add Enrollment Form */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Add New Enrollment
          </h2>
          <form action={handleAddEnrollment} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>School Year</label>
              <input name="school_year" type="text" placeholder="e.g. 2025-2026" required pattern="\d{4}-\d{4}"
                className="input-field rounded-xl px-4 py-2.5 text-sm w-40" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Semester</label>
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

        {/* Enrollment Records */}
        <div className="space-y-4">
          {enrollmentsWithSubjects.length === 0 ? (
            <div className="rounded-2xl px-6 py-16 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No enrollments yet. Add one above.</p>
            </div>
          ) : (
            enrollmentsWithSubjects.map((enrollment) => {
              const sem = semColors[enrollment.semester] ?? semColors[1];
              const enrolledIds = new Set(enrollment.subjects.map((s: any) => s.subject_id));
              const availableSubjects = allSubjects.rows.filter((s: any) => !enrolledIds.has(s.subject_id));

              return (
                <div key={enrollment.enrollment_id} className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--bg-card)", border: `1px solid ${sem.border}` }}>

                  {/* Header */}
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
                      <span className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                        {enrollment.subjects.length} subject{enrollment.subjects.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <form action={handleDeleteEnrollment}>
                      <input type="hidden" name="enrollment_id" value={enrollment.enrollment_id} />
                      <button type="submit" className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80"
                        style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                        Remove
                      </button>
                    </form>
                  </div>

                  {/* Subjects + Grades table */}
                  <div className="overflow-x-auto">
                    {enrollment.subjects.length > 0 && (
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["#", "Subject", "Prelim", "Midterm", "Final", "Remarks", ""].map((h) => (
                              <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "var(--text-muted)" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {enrollment.subjects.map((subject: any, idx: number) => {
                            const g = gradeMap.get(subject.enrollment_subject_id);
                            return (
                              <tr key={subject.enrollment_subject_id}
                                style={{ borderBottom: "1px solid var(--border)" }}>
                                <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs px-2 py-0.5 rounded-lg font-semibold"
                                      style={{ background: sem.bg, color: sem.color, border: `1px solid ${sem.border}` }}>
                                      {subject.subject_code}
                                    </span>
                                    <span style={{ color: "var(--text-primary)" }}>{subject.subject_name}</span>
                                  </div>
                                </td>

                                {/* Grade cells — inline editable */}
                                <td className="px-5 py-3">
                                  <GradeCell
                                    enrollmentSubjectId={subject.enrollment_subject_id}
                                    field="prelim"
                                    value={g?.prelim_grade ?? null}
                                    prelimGrade={g?.prelim_grade ?? null}
                                    midtermGrade={g?.midterm_grade ?? null}
                                    finalGrade={g?.final_grade ?? null}
                                    remarks={g?.remarks ?? "In Progress"}
                                  />
                                </td>
                                <td className="px-5 py-3">
                                  <GradeCell
                                    enrollmentSubjectId={subject.enrollment_subject_id}
                                    field="midterm"
                                    value={g?.midterm_grade ?? null}
                                    prelimGrade={g?.prelim_grade ?? null}
                                    midtermGrade={g?.midterm_grade ?? null}
                                    finalGrade={g?.final_grade ?? null}
                                    remarks={g?.remarks ?? "In Progress"}
                                  />
                                </td>
                                <td className="px-5 py-3">
                                  <GradeCell
                                    enrollmentSubjectId={subject.enrollment_subject_id}
                                    field="final"
                                    value={g?.final_grade ?? null}
                                    prelimGrade={g?.prelim_grade ?? null}
                                    midtermGrade={g?.midterm_grade ?? null}
                                    finalGrade={g?.final_grade ?? null}
                                    remarks={g?.remarks ?? "In Progress"}
                                  />
                                </td>
                                <td className="px-5 py-3">
                                  <RemarksSelect
                                    enrollmentSubjectId={subject.enrollment_subject_id}
                                    value={g?.remarks ?? "In Progress"}
                                    prelimGrade={g?.prelim_grade ?? null}
                                    midtermGrade={g?.midterm_grade ?? null}
                                    finalGrade={g?.final_grade ?? null}
                                  />
                                </td>
                                <td className="px-5 py-3">
                                  <form action={handleRemoveSubject}>
                                    <input type="hidden" name="enrollment_subject_id" value={subject.enrollment_subject_id} />
                                    <button type="submit" className="p-1.5 rounded-lg hover:opacity-70"
                                      style={{ color: "var(--text-muted)" }} title="Remove subject">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                      </svg>
                                    </button>
                                  </form>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                    {enrollment.subjects.length === 0 && (
                      <p className="px-6 py-4 text-sm" style={{ color: "var(--text-muted)" }}>No subjects yet.</p>
                    )}
                  </div>

                  {/* Add subject */}
                  {availableSubjects.length > 0 && (
                    <div className="px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                      <form action={handleAddSubject} className="flex gap-2 items-center">
                        <input type="hidden" name="enrollment_id" value={enrollment.enrollment_id} />
                        <select name="subject_id" required className="input-field flex-1 rounded-xl px-3 py-2 text-sm" style={inputStyle}>
                          <option value="">Select subject to add…</option>
                          {availableSubjects.map((sub: any) => (
                            <option key={sub.subject_id} value={sub.subject_id}>
                              {sub.subject_code} — {sub.subject_name}
                            </option>
                          ))}
                        </select>
                        <button type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 shrink-0"
                          style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Add
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </section>
    </main>
  );
}
