import { pool } from "./db";

export async function createStudent(
  studentNo: string,
  firstName: string,
  middleName: string,
  lastName: string,
  yearLevel: number,
  courseId: number
) {
  await pool.query(
    `INSERT INTO fmstudents
      (student_no, first_name, middle_name, last_name, year_level, course_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [studentNo, firstName, middleName, lastName, yearLevel, courseId]
  );
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
}

export async function setStudentStatus(studentId: number, status: "active" | "inactive") {
  await pool.query(
    `UPDATE fmstudents SET status = $1 WHERE student_id = $2`,
    [status, studentId]
  );
}

export async function deleteStudent(studentId: number) {
  // Remove enrollments first to avoid FK violation
  await pool.query(`DELETE FROM fmenrollments WHERE student_id = $1`, [studentId]);
  await pool.query(`DELETE FROM fmstudents    WHERE student_id = $1`, [studentId]);
}
