import { unstable_noStore as noStore } from "next/cache";
import { pool } from "@/lib/db";
import { deleteStudent, setStudentStatus } from "@/lib/student";
import { redirect } from "next/navigation";
import StudentsClient from "./StudentsClient";

export default async function Students() {
  noStore();

  const result = await pool.query(`
    SELECT
      s.student_id, s.student_no, s.first_name, s.middle_name, s.last_name,
      c.course_code, s.year_level, s.status, s.photo_url
    FROM fmstudents s
    LEFT JOIN fmcourses c ON s.course_id = c.course_id
    ORDER BY s.student_no ASC
  `);

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteStudent(Number(formData.get("student_id")));
    redirect("/students");
  }

  async function handleSetInactive(formData: FormData) {
    "use server";
    await setStudentStatus(Number(formData.get("student_id")), "inactive");
    redirect("/students");
  }

  async function handleSetActive(formData: FormData) {
    "use server";
    await setStudentStatus(Number(formData.get("student_id")), "active");
    redirect("/students");
  }

  return (
    <StudentsClient
      students={result.rows}
      handleDelete={handleDelete}
      handleSetInactive={handleSetInactive}
      handleSetActive={handleSetActive}
    />
  );
}
