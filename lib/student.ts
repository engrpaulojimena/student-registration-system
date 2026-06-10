import { pool } from "./db";

export async function createStudent(
  studentNo: string,
  firstName: string,
  lastName: string,
  yearLevel: number,
  courseId: number
) {
  await pool.query(
    `
    INSERT INTO fmstudents
    (
      student_no,
      first_name,
      last_name,
      year_level,
      course_id
    )
    VALUES ($1,$2,$3,$4,$5)
    `,
    [
      studentNo,
      firstName,
      lastName,
      yearLevel,
      courseId
    ]
  );
}