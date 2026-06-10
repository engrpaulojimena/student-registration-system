export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
    <div className="text-5xl text-center mb-4">
  🎓
</div>

<h1 className="text-3xl font-bold text-white text-center mb-2">
  Student Registration System
</h1>

        <p className="text-slate-400 text-center mb-8">
           Manage students, courses, subjects and enrollments
        </p>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
          />

              <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 p-3 rounded-lg text-white font-semibold"
      >
        Login
      </button>
        </form>
      </div>
    </main>
  );
}