import { pool } from "@/lib/db";
import { getEnrollmentsByStudent, getSubjectsByEnrollment } from "@/lib/enrollment";
import { getGradesByStudent } from "@/lib/grade";
import { notFound } from "next/navigation";
import PrintTriggerButton from "./PrintTriggerButton";
import type { Metadata } from "next";

const remarksColors: Record<string, string> = {
  "Passed":      "#16a34a",
  "Failed":      "#dc2626",
  "Incomplete":  "#d97706",
  "Dropped":     "#6b7280",
  "In Progress": "#7c3aed",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ student_id: string }>;
}): Promise<Metadata> {
  const { student_id } = await params;
  const result = await pool.query(
    `SELECT first_name, middle_name, last_name FROM fmstudents WHERE student_id = $1`,
    [Number(student_id)]
  );
  const s = result.rows[0];
  const name = s ? `${s.first_name}${s.middle_name ? " " + s.middle_name : ""} ${s.last_name}` : "Student";
  return { title: `Grades — ${name}` };
}

export default async function PrintGrades({
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
  const gradeMap = new Map(grades.map((g) => [g.enrollment_subject_id, g]));

  const enrollmentsWithSubjects = await Promise.all(
    enrollments.map(async (e) => ({
      ...e,
      subjects: await getSubjectsByEnrollment(e.enrollment_id),
    }))
  );

  const fullName = `${student.first_name}${student.middle_name ? " " + student.middle_name : ""} ${student.last_name}`;
  const totalPassed = grades.filter(g => g.remarks === "Passed").length;
  const totalSubjects = grades.length;

  // A subject only counts toward an average once it has a final grade —
  // in-progress subjects (no final grade yet) are excluded so the GWA
  // isn't dragged down by classes that simply haven't finished.
  const gradedSubjects = grades.filter(g => g.final_grade !== null);
  const overallAverage = gradedSubjects.length > 0
    ? gradedSubjects.reduce((sum, g) => sum + Number(g.final_grade), 0) / gradedSubjects.length
    : null;

  function semesterAverage(enrollmentId: number) {
    const semGrades = grades.filter(g => g.enrollment_id === enrollmentId && g.final_grade !== null);
    if (semGrades.length === 0) return null;
    return semGrades.reduce((sum, g) => sum + Number(g.final_grade), 0) / semGrades.length;
  }

  return (
    <div className="print-page">
      <style>{`
        .print-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .print-page { font-family: 'Arial', sans-serif; font-size: 12px; color: #111; padding: 32px; background: #fff; min-height: 100vh; }
        .print-page h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .print-page .subtitle { font-size: 12px; color: #555; margin-bottom: 24px; }
        .print-page .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
        .print-page .info-item { display: flex; gap: 8px; }
        .print-page .info-label { font-weight: 600; color: #555; min-width: 90px; }
        .print-page .sem-block { margin-bottom: 24px; }
        .print-page .sem-header { background: #f3f4f6; padding: 8px 12px; border-radius: 6px 6px 0 0; font-weight: 700; font-size: 13px; border: 1px solid #ddd; }
        .print-page table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-top: none; }
        .print-page th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #555; border-bottom: 1px solid #ddd; }
        .print-page td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
        .print-page tr:last-child td { border-bottom: none; }
        .print-page .code { font-family: monospace; font-size: 11px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        .print-page .grade { text-align: center; font-weight: 600; }
        .print-page .summary { margin-top: 24px; padding: 12px 16px; background: #f9fafb; border: 1px solid #ddd; border-radius: 8px; display: flex; gap: 24px; }
        .print-page .sum-item { display: flex; flex-direction: column; }
        .print-page .sum-val { font-size: 20px; font-weight: 700; color: #7c3aed; }
        .print-page .sum-lbl { font-size: 11px; color: #555; }
        .print-page .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; display: flex; justify-content: space-between; color: #888; font-size: 10px; }
        @media print {
          body * { visibility: hidden; }
          .print-page, .print-page * { visibility: visible; }
          .print-page { position: absolute; left: 0; top: 0; padding: 16px; }
          .print-page button { display: none; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1>Academic Report</h1>
          <p className="subtitle">EduTrack Student Registration System</p>
        </div>
        <PrintTriggerButton />
      </div>

      <div className="info-grid">
        <div className="info-item"><span className="info-label">Student Name:</span><span>{fullName}</span></div>
        <div className="info-item"><span className="info-label">Student No:</span><span>{student.student_no}</span></div>
        <div className="info-item"><span className="info-label">Course:</span><span>{student.course_code} — {student.course_name}</span></div>
        <div className="info-item"><span className="info-label">Year Level:</span><span>Year {student.year_level}</span></div>
        <div className="info-item"><span className="info-label">Status:</span><span style={{ textTransform: "capitalize" }}>{student.status}</span></div>
        <div className="info-item"><span className="info-label">Date Printed:</span><span>{new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</span></div>
      </div>

      {enrollmentsWithSubjects.map((enrollment) => {
        const semAvg = semesterAverage(enrollment.enrollment_id);
        return (
        <div key={enrollment.enrollment_id} className="sem-block">
          <div className="sem-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>S.Y. {enrollment.school_year} — Semester {enrollment.semester}</span>
            {semAvg !== null && (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed" }}>
                Sem. Average: {semAvg.toFixed(2)}
              </span>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th style={{ width: "100px" }}>Code</th>
                <th>Subject Name</th>
                <th style={{ width: "80px", textAlign: "center" }}>Prelim</th>
                <th style={{ width: "80px", textAlign: "center" }}>Midterm</th>
                <th style={{ width: "80px", textAlign: "center" }}>Final</th>
                <th style={{ width: "90px" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {enrollment.subjects.map((sub: any, idx: number) => {
                const g = gradeMap.get(sub.enrollment_subject_id);
                return (
                  <tr key={sub.enrollment_subject_id}>
                    <td style={{ color: "#9ca3af" }}>{idx + 1}</td>
                    <td><span className="code">{sub.subject_code}</span></td>
                    <td>{sub.subject_name}</td>
                    <td className="grade">{g?.prelim_grade ?? "—"}</td>
                    <td className="grade">{g?.midterm_grade ?? "—"}</td>
                    <td className="grade">{g?.final_grade ?? "—"}</td>
                    <td style={{ color: remarksColors[g?.remarks ?? "In Progress"] ?? "#7c3aed", fontWeight: 600 }}>
                      {g?.remarks ?? "In Progress"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {semAvg !== null && (
              <tfoot>
                <tr style={{ background: "#f9fafb" }}>
                  <td colSpan={5} style={{ textAlign: "right", fontWeight: 700, fontSize: "11px", color: "#555" }}>
                    Semester Average (based on final grades)
                  </td>
                  <td className="grade" style={{ fontWeight: 700, color: "#7c3aed" }}>{semAvg.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        );
      })}

      <div className="summary">
        <div className="sum-item"><span className="sum-val">{enrollments.length}</span><span className="sum-lbl">Semesters</span></div>
        <div className="sum-item"><span className="sum-val">{totalSubjects}</span><span className="sum-lbl">Total Subjects</span></div>
        <div className="sum-item"><span className="sum-val" style={{ color: "#16a34a" }}>{totalPassed}</span><span className="sum-lbl">Passed</span></div>
        <div className="sum-item"><span className="sum-val" style={{ color: "#dc2626" }}>{grades.filter(g => g.remarks === "Failed").length}</span><span className="sum-lbl">Failed</span></div>
        <div className="sum-item"><span className="sum-val" style={{ color: "#7c3aed" }}>{grades.filter(g => g.remarks === "In Progress").length}</span><span className="sum-lbl">In Progress</span></div>
        {overallAverage !== null && (
          <div className="sum-item">
            <span className="sum-val" style={{ color: "#0891b2" }}>{overallAverage.toFixed(2)}</span>
            <span className="sum-lbl">Overall Average</span>
          </div>
        )}
      </div>

      {overallAverage !== null && overallAverage >= 90 && (
        <div style={{
          marginTop: "12px", padding: "10px 16px", background: "#fef9c3",
          border: "1px solid #fde047", borderRadius: "8px",
          fontSize: "11px", fontWeight: 600, color: "#854d0e",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          ★ {overallAverage >= 95 ? "With Highest Honors" : overallAverage >= 92 ? "With High Honors" : "With Honors"} — based on overall average of graded subjects
        </div>
      )}

      <div className="footer">
        <span>Generated by EduTrack Registration System</span>
        <span>{new Date().toLocaleString("en-PH")}</span>
      </div>
    </div>
  );
}