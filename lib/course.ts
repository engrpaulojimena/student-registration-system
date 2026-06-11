import { pool } from "./db";

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