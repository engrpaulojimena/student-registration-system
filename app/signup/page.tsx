"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]   = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error);
      return;
    }

    setStatus("success");
    setMessage("Request sent! Please wait for admin approval before logging in.");
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            E
          </div>
          <h1 className="text-2xl font-bold text-white">EduTrack</h1>
          <p className="text-slate-500 text-sm mt-1">Registration System</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-2">Request Access</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your request will be reviewed by the admin before you can log in.
          </p>

          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <p className="text-emerald-400 font-semibold mb-2">Request Submitted!</p>
              <p className="text-slate-400 text-sm">{message}</p>
              <Link
                href="/"
                className="inline-block mt-6 text-indigo-400 hover:text-indigo-300 text-sm transition"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition rounded-lg py-3 text-sm font-semibold text-white mt-2"
              >
                {status === "loading" ? "Submitting..." : "Submit Request"}
              </button>

              <p className="text-center text-slate-500 text-sm mt-4">
                Already have an account?{" "}
                <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}
