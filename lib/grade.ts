import { pool } from "./db";
import { logAction } from "./audit";

export interface Grade {
  grade_id:              number;
  enrollment_subject_id: number;
  prelim_grade:          number | null;
  midterm_grade:         number | null;
  final_grade:           number | null;
  remarks:               string;
}

export async function getGradesByStudent(studentId: number) {
  const result = await pool.query(
    `SELECT
       g.grade_id,
       g.enrollment_subject_id,
       g.prelim_grade,
       g.midterm_grade,
       g.final_grade,
       g.remarks,
       e.enrollment_id,
       e.school_year,
       e.semester,
       sub.subject_id,
       sub.subject_code,
       sub.subject_name
     FROM fmgrades g
     INNER JOIN fmenrollment_subjects es ON es.enrollment_subject_id = g.enrollment_subject_id
     INNER JOIN fmenrollments e          ON e.enrollment_id          = es.enrollment_id
     INNER JOIN fmsubjects sub           ON sub.subject_id           = es.subject_id
     WHERE e.student_id = $1
     ORDER BY e.school_year DESC, e.semester ASC, sub.subject_code ASC`,
    [studentId]
  );
  return result.rows;
}

export async function upsertGrade(
  enrollmentSubjectId: number,
  prelimGrade: number | null,
  midtermGrade: number | null,
  finalGrade: number | null,
  remarks: string
) {
  // Auto-suggest Passed/Failed once a final grade exists, but only if the
  // incoming remarks is still the default "In Progress" — this means we
  // never silently override a manual choice like "Incomplete" or "Dropped".
  let resolvedRemarks = remarks;
  if (remarks === "In Progress" && finalGrade !== null) {
    resolvedRemarks = finalGrade >= 75 ? "Passed" : "Failed";
  }

  await pool.query(
    `INSERT INTO fmgrades (enrollment_subject_id, prelim_grade, midterm_grade, final_grade, remarks, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (enrollment_subject_id) DO UPDATE
       SET prelim_grade  = EXCLUDED.prelim_grade,
           midterm_grade = EXCLUDED.midterm_grade,
           final_grade   = EXCLUDED.final_grade,
           remarks       = EXCLUDED.remarks,
           updated_at    = NOW()`,
    [enrollmentSubjectId, prelimGrade, midtermGrade, finalGrade, resolvedRemarks]
  );
  await logAction(
    "UPDATE",
    "student",
    enrollmentSubjectId,
    `Updated grade for enrollment_subject #${enrollmentSubjectId}: prelim=${prelimGrade}, midterm=${midtermGrade}, final=${finalGrade}, remarks=${resolvedRemarks}`
  );

  return resolvedRemarks;
}
