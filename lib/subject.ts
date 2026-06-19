import { pool } from "./db";
import { logAction } from "./audit";

export async function getSubjects() {
  const result = await pool.query(`
    SELECT
      subject_id,
      subject_code,
      subject_name
    FROM fmsubjects
    ORDER BY subject_code ASC
  `);

  return result.rows;
}

export async function createSubject(subjectCode: string, subjectName: string) {
  const result = await pool.query(
    `INSERT INTO fmsubjects (subject_code, subject_name) VALUES ($1, $2) RETURNING subject_id`,
    [subjectCode, subjectName]
  );
  await logAction("CREATE", "subject", result.rows[0].subject_id, `Added subject ${subjectCode} — ${subjectName}`);
}

export async function updateSubject(subjectId: number, subjectCode: string, subjectName: string) {
  await pool.query(
    `UPDATE fmsubjects SET subject_code = $1, subject_name = $2 WHERE subject_id = $3`,
    [subjectCode, subjectName, subjectId]
  );
  await logAction("UPDATE", "subject", subjectId, `Updated subject to ${subjectCode} — ${subjectName}`);
}

export async function deleteSubject(subjectId: number) {
  // Block delete if subject is currently used in any enrollment
  const inUse = await pool.query(
    `SELECT COUNT(*) FROM fmenrollment_subjects WHERE subject_id = $1`,
    [subjectId]
  );
  if (Number(inUse.rows[0].count) > 0) {
    throw new Error("Cannot delete: subject is currently used in student enrollments.");
  }

  const existing = await pool.query(`SELECT subject_code FROM fmsubjects WHERE subject_id = $1`, [subjectId]);
  await pool.query(`DELETE FROM fmsubjects WHERE subject_id = $1`, [subjectId]);
  await logAction("DELETE", "subject", subjectId, `Deleted subject ${existing.rows[0]?.subject_code ?? subjectId}`);
}