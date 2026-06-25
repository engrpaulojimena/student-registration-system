import { pool } from "./db";
import { logAction } from "./audit";

export async function createStudent(
  studentNo: string,
  firstName: string,
  middleName: string,
  lastName: string,
  yearLevel: number,
  courseId: number
) {
  const result = await pool.query(
    `INSERT INTO fmstudents
      (student_no, first_name, middle_name, last_name, year_level, course_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING student_id`,
    [studentNo, firstName, middleName, lastName, yearLevel, courseId]
  );
  const studentId = result.rows[0].student_id;
  await logAction("CREATE", "student", studentId, `Added student ${firstName} ${lastName} (${studentNo})`);
  return studentId;
}

export async function updateStudent(
  studentId: number,
  firstName: string,
  middleName: string,
  lastName: string,
  yearLevel: number,
  courseId: number
) {
  await pool.query(
    `UPDATE fmstudents
     SET first_name  = $1,
         middle_name = $2,
         last_name   = $3,
         year_level  = $4,
         course_id   = $5
     WHERE student_id = $6`,
    [firstName, middleName, lastName, yearLevel, courseId, studentId]
  );
  await logAction("UPDATE", "student", studentId, `Updated student ${firstName} ${lastName}`);
}

export async function setStudentStatus(studentId: number, status: "active" | "inactive") {
  await pool.query(
    `UPDATE fmstudents SET status = $1 WHERE student_id = $2`,
    [status, studentId]
  );
  await logAction("UPDATE", "student", studentId, `Set student status to ${status}`);
}

export async function deleteStudent(studentId: number) {
  const existing = await pool.query(
    `SELECT student_no, first_name, last_name FROM fmstudents WHERE student_id = $1`,
    [studentId]
  );
  const s = existing.rows[0];

  // Remove enrollments first to avoid FK violation
  await pool.query(`DELETE FROM fmenrollments WHERE student_id = $1`, [studentId]);
  await pool.query(`DELETE FROM fmstudents    WHERE student_id = $1`, [studentId]);

  if (s) {
    await logAction("DELETE", "student", studentId, `Deleted student ${s.first_name} ${s.last_name} (${s.student_no})`);
  }
}

export async function generateStudentNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `STU-${year}-`;

  // Find the highest sequence number for this year
  const result = await pool.query(
    `SELECT student_no FROM fmstudents
     WHERE student_no LIKE $1
     ORDER BY student_no DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (result.rows.length > 0) {
    const lastNo: string = result.rows[0].student_no;
    const lastSeq = parseInt(lastNo.replace(prefix, ""), 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}