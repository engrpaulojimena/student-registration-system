
import { pool } from "@/lib/db";
import Sidebar from "@/components/Sidebar";


export default async function Dashboard() {

  const studentsCount = await pool.query(
    "SELECT COUNT(*) FROM fmstudents"
  );

  const coursesCount = await pool.query(
    "SELECT COUNT(*) FROM fmcourses"
  );

  const subjectsCount = await pool.query(
    "SELECT COUNT(*) FROM fmsubjects"
  );

  const enrollmentsCount = await pool.query(
    "SELECT COUNT(*) FROM fmenrollments"
  );

return (
  <main className="min-h-screen bg-slate-950 text-white flex">

    <Sidebar />

    <section className="flex-1 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-slate-400">Students</h2>
          <p className="text-4xl font-bold mt-2">
            {studentsCount.rows[0].count}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-slate-400">Courses</h2>
          <p className="text-4xl font-bold mt-2">
            {coursesCount.rows[0].count}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-slate-400">Subjects</h2>
          <p className="text-4xl font-bold mt-2">
            {subjectsCount.rows[0].count}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-slate-400">Enrollments</h2>
          <p className="text-4xl font-bold mt-2">
            {enrollmentsCount.rows[0].count}
          </p>
        </div>

      </div>

    </section>

  </main>
);
}