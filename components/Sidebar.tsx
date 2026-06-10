import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 min-h-screen">

      <Link
        href="/dashboard"
        className="text-2xl font-bold mb-8 block"
      >
        🎓 Student Log
      </Link>

      <nav className="space-y-2">

        <Link
          href="/dashboard"
          className="block p-3 rounded-lg hover:bg-slate-800 transition"
        >
          📊 Dashboard
        </Link>

        <Link
          href="/students"
          className="block p-3 rounded-lg hover:bg-slate-800 transition"
        >
          👨‍🎓 Students
        </Link>

        <Link
          href="/courses"
          className="block p-3 rounded-lg hover:bg-slate-800 transition"
        >
          📚 Courses
        </Link>

        <Link
          href="/subjects"
          className="block p-3 rounded-lg hover:bg-slate-800 transition"
        >
          📝 Subjects
        </Link>

        <Link
          href="/enrollments"
          className="block p-3 rounded-lg hover:bg-slate-800 transition"
        >
          📋 Enrollments
        </Link>

      </nav>

    </aside>
  );
}