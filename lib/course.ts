import { pool } from "./db";
import { logAction } from "./audit";

export async function getCourses() {
  const result = await pool.query(`
    SELECT
      course_id,
      course_code,
      course_name
    FROM fmcourses
    ORDER BY course_name
  `);

  return result.rows;
}

export async function createCourse(courseCode: string, courseName: string) {
  const result = await pool.query(
    `INSERT INTO fmcourses (course_code, course_name) VALUES ($1, $2) RETURNING course_id`,
    [courseCode, courseName]
  );
  await logAction("CREATE", "course", result.rows[0].course_id, `Added course ${courseCode} — ${courseName}`);
}

export async function updateCourse(courseId: number, courseCode: string, courseName: string) {
  await pool.query(
    `UPDATE fmcourses SET course_code = $1, course_name = $2 WHERE course_id = $3`,
    [courseCode, courseName, courseId]
  );
  await logAction("UPDATE", "course", courseId, `Updated course to ${courseCode} — ${courseName}`);
}

export async function deleteCourse(courseId: number) {
  // Block delete if students are currently assigned to this course
  const inUse = await pool.query(
    `SELECT COUNT(*) FROM fmstudents WHERE course_id = $1`,
    [courseId]
  );
  if (Number(inUse.rows[0].count) > 0) {
    throw new Error("Cannot delete: students are currently enrolled in this course.");
  }

  const existing = await pool.query(`SELECT course_code FROM fmcourses WHERE course_id = $1`, [courseId]);
  await pool.query(`DELETE FROM fmcourses WHERE course_id = $1`, [courseId]);
  await logAction("DELETE", "course", courseId, `Deleted course ${existing.rows[0]?.course_code ?? courseId}`);
}