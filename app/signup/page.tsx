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
    setMessage("Your request has been submitted. Wait for admin approval before logging in.");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>EduTrack</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Request Administrator Access</p>
        </div>

        <div className="rounded-2xl p-8 gradient-border"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

          {status === "success" ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Request Submitted</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{message}</p>
              <Link href="/" className="inline-flex items-center gap-2 mt-6 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--accent-violet-bright)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Create request</h2>
              <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
                An admin will review and approve your access.
              </p>

              <form onSubmit={handleSignup} className="space-y-5">
                {[
                  { label: "Full Name", type: "text", val: fullName, set: setFullName, placeholder: "Juan Dela Cruz" },
                  { label: "Email Address", type: "email", val: email, set: setEmail, placeholder: "you@school.edu" },
                  { label: "Password", type: "password", val: password, set: setPassword, placeholder: "Min. 8 characters", min: 8 },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-secondary)" }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={field.val}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      required
                      minLength={field.min}
                      className="input-field w-full rounded-xl px-4 py-3 text-sm transition-all"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}

                {status === "error" && (
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2"
                  style={{
                    background: status === "loading" ? "var(--border)" : "linear-gradient(135deg, #7C3AED, #06B6D4)",
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                  }}
                >
                  {status === "loading" ? "Submitting..." : "Submit Request"}
                </button>

                <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Have an account?{" "}
                  <Link href="/" className="font-medium hover:opacity-80" style={{ color: "var(--accent-violet-bright)" }}>
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
