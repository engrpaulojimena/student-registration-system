import { pool } from "./db";
import { logAction } from "./audit";

// ── Enrollment (per semester) ──────────────────────────────────────────────

export async function getEnrollmentsByStudent(studentId: number) {
  const result = await pool.query(
    `SELECT
       e.enrollment_id,
       e.school_year,
       e.semester,
       COUNT(es.subject_id)::int AS subject_count
     FROM fmenrollments e
     LEFT JOIN fmenrollment_subjects es ON es.enrollment_id = e.enrollment_id
     WHERE e.student_id = $1
     GROUP BY e.enrollment_id, e.school_year, e.semester
     ORDER BY e.school_year DESC, e.semester ASC`,
    [studentId]
  );
  return result.rows;
}

export async function createEnrollment(
  studentId: number,
  schoolYear: string,
  semester: number
) {
  // Prevent duplicate enrollment for same student/year/sem
  const existing = await pool.query(
    `SELECT enrollment_id FROM fmenrollments
     WHERE student_id = $1 AND school_year = $2 AND semester = $3`,
    [studentId, schoolYear, semester]
  );
  if (existing.rows.length > 0) {
    throw new Error("Student is already enrolled for this school year and semester.");
  }
  const result = await pool.query(
    `INSERT INTO fmenrollments (student_id, school_year, semester)
     VALUES ($1, $2, $3)
     RETURNING enrollment_id`,
    [studentId, schoolYear, semester]
  );
  await logAction(
    "CREATE",
    "enrollment",
    result.rows[0].enrollment_id,
    `Created enrollment for student #${studentId} — ${schoolYear} Sem ${semester}`
  );
  return result.rows[0].enrollment_id;
}

export async function deleteEnrollment(enrollmentId: number) {
  await pool.query(`DELETE FROM fmenrollment_subjects WHERE enrollment_id = $1`, [enrollmentId]);
  await pool.query(`DELETE FROM fmenrollments WHERE enrollment_id = $1`, [enrollmentId]);
  await logAction("DELETE", "enrollment", enrollmentId, `Deleted enrollment #${enrollmentId}`);
}

// ── Enrollment Subjects ────────────────────────────────────────────────────

export async function getSubjectsByEnrollment(enrollmentId: number) {
  const result = await pool.query(
    `SELECT
       es.enrollment_subject_id,
       sub.subject_id,
       sub.subject_code,
       sub.subject_name
     FROM fmenrollment_subjects es
     INNER JOIN fmsubjects sub ON sub.subject_id = es.subject_id
     WHERE es.enrollment_id = $1
     ORDER BY sub.subject_code ASC`,
    [enrollmentId]
  );
  return result.rows;
}

export async function addSubjectToEnrollment(enrollmentId: number, subjectId: number) {
  // Prevent duplicate subject in same enrollment
  const existing = await pool.query(
    `SELECT enrollment_subject_id FROM fmenrollment_subjects
     WHERE enrollment_id = $1 AND subject_id = $2`,
    [enrollmentId, subjectId]
  );
  if (existing.rows.length > 0) {
    throw new Error("Subject already added to this enrollment.");
  }
  await pool.query(
    `INSERT INTO fmenrollment_subjects (enrollment_id, subject_id) VALUES ($1, $2)`,
    [enrollmentId, subjectId]
  );
  await logAction("UPDATE", "enrollment", enrollmentId, `Added subject #${subjectId} to enrollment #${enrollmentId}`);
}

export async function removeSubjectFromEnrollment(enrollmentSubjectId: number) {
  await pool.query(
    `DELETE FROM fmenrollment_subjects WHERE enrollment_subject_id = $1`,
    [enrollmentSubjectId]
  );
  await logAction("UPDATE", "enrollment", null, `Removed subject (enrollment_subject_id #${enrollmentSubjectId})`);
}

// ── All enrollments (for /enrollments page) ────────────────────────────────

export async function getAllEnrollments() {
  const result = await pool.query(
    `SELECT
       e.enrollment_id,
       e.school_year,
       e.semester,
       s.student_id,
       s.student_no,
       s.first_name || ' ' || s.last_name AS student_name,
       s.photo_url,
       c.course_code,
       COUNT(es.subject_id)::int AS subject_count
     FROM fmenrollments e
     INNER JOIN fmstudents s ON s.student_id = e.student_id
     INNER JOIN fmcourses  c ON c.course_id  = s.course_id
     LEFT  JOIN fmenrollment_subjects es ON es.enrollment_id = e.enrollment_id
     GROUP BY e.enrollment_id, s.student_id, c.course_code
     ORDER BY e.school_year DESC, e.semester ASC, s.student_no ASC`
  );
  return result.rows;
}
