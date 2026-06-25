"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const PAGE_SIZE = 10;

const yearLabels: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: "1st Year", color: "#A78BFA", bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.25)" },
  2: { label: "2nd Year", color: "#22D3EE", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)"  },
  3: { label: "3rd Year", color: "#34D399", bg: "rgba(5,150,105,0.1)",   border: "rgba(5,150,105,0.25)"  },
  4: { label: "4th Year", color: "#FB923C", bg: "rgba(217,119,6,0.1)",   border: "rgba(217,119,6,0.25)"  },
};

type Student = {
  student_id: number;
  student_no: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  course_code: string | null;
  year_level: number;
  status: string;
  photo_url: string | null;
};

type Props = {
  students: Student[];
  handleDelete: (formData: FormData) => Promise<void>;
  handleSetInactive: (formData: FormData) => Promise<void>;
  handleSetActive: (formData: FormData) => Promise<void>;
};

export default function StudentsClient({ students, handleDelete, handleSetInactive, handleSetActive }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) => {
      const fullName = `${s.first_name} ${s.middle_name ?? ""} ${s.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        s.student_no.toLowerCase().includes(q) ||
        (s.course_code ?? "").toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const active   = students.filter((s) => s.status === "active").length;
  const inactive = students.filter((s) => s.status === "inactive").length;

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  // Build page number list with ellipsis
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <main className="min-h-screen flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Sidebar />
      <section className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{students.length} total</span>
              <span style={{ color: "var(--border-bright)" }}>·</span>
              <span className="flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#34D399" }} />
                <span style={{ color: "#34D399" }}>{active} active</span>
              </span>
              <span style={{ color: "var(--border-bright)" }}>·</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{inactive} inactive</span>
            </div>
          </div>
          <Link
            href="/students/add"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Student
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, student no., or course…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {filtered.length === 0 ? "No results found." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {students.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                className="mx-auto mb-4" style={{ color: "var(--text-muted)" }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>No students registered yet.</p>
              <Link href="/students/add" className="text-sm font-medium hover:opacity-80" style={{ color: "#A78BFA" }}>
                Add your first student →
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                className="mx-auto mb-3" style={{ color: "var(--text-muted)" }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No students match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Photo", "Student No.", "Name", "Course", "Year Level", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((student) => {
                    const yr = yearLabels[student.year_level] || yearLabels[1];
                    const fullName = `${student.first_name} ${student.last_name}`;
                    const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
                    return (
                      <tr key={student.student_id} className="table-row-hover transition-all"
                        style={{ borderBottom: "1px solid var(--border)", opacity: student.status === "inactive" ? 0.45 : 1 }}>

                        <td className="px-5 py-3">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt={fullName}
                              className="w-10 h-10 rounded-xl object-cover"
                              style={{ border: "2px solid var(--border)" }} />
                          ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: "linear-gradient(135deg, #7C3AED55, #06B6D455)", color: "#A78BFA", border: "2px solid var(--border)" }}>
                              {initials}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          {student.student_no}
                        </td>

                        <td className="px-5 py-3">
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {student.last_name}, {student.first_name}
                            {student.middle_name ? ` ${student.middle_name[0]}.` : ""}
                          </p>
                        </td>

                        <td className="px-5 py-3">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)" }}>
                            {student.course_code ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: yr.bg, color: yr.color, border: `1px solid ${yr.border}` }}>
                            {yr.label}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          {student.status === "active" ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#34D399" }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-muted)" }} />Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/students/${student.student_id}`}
                              className="px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors"
                              style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}>
                              View
                            </Link>
                            <Link href={`/students/${student.student_id}/edit`}
                              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                              Edit
                            </Link>
                            {student.status === "active" ? (
                              <form action={handleSetInactive}>
                                <input type="hidden" name="student_id" value={student.student_id} />
                                <button type="submit" className="px-3 py-1.5 text-xs rounded-lg font-medium"
                                  style={{ background: "rgba(217,119,6,0.08)", color: "#FB923C", border: "1px solid rgba(217,119,6,0.25)" }}>
                                  Deactivate
                                </button>
                              </form>
                            ) : (
                              <form action={handleSetActive}>
                                <input type="hidden" name="student_id" value={student.student_id} />
                                <button type="submit" className="px-3 py-1.5 text-xs rounded-lg font-medium"
                                  style={{ background: "rgba(5,150,105,0.08)", color: "#34D399", border: "1px solid rgba(5,150,105,0.25)" }}>
                                  Activate
                                </button>
                              </form>
                            )}
                            <form action={handleDelete}>
                              <input type="hidden" name="student_id" value={student.student_id} />
                              <button type="submit" className="px-3 py-1.5 text-xs rounded-lg font-medium"
                                style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Page {safePage} of {totalPages} · {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage(1)} disabled={safePage === 1}
                      className="px-2.5 py-1.5 text-xs rounded-lg font-medium disabled:opacity-30"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                      «
                    </button>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                      className="px-3 py-1.5 text-xs rounded-lg font-medium disabled:opacity-30"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                      Prev
                    </button>
                    {pageNumbers.map((item, i) =>
                      item === "..." ? (
                        <span key={`e-${i}`} className="px-2 text-xs" style={{ color: "var(--text-muted)" }}>…</span>
                      ) : (
                        <button key={item} onClick={() => setPage(item as number)}
                          className="w-8 h-8 text-xs rounded-lg font-medium transition-all"
                          style={{
                            background: safePage === item ? "linear-gradient(135deg, #7C3AED, #06B6D4)" : "var(--bg-elevated)",
                            color: safePage === item ? "#fff" : "var(--text-secondary)",
                            border: safePage === item ? "none" : "1px solid var(--border)",
                          }}>
                          {item}
                        </button>
                      )
                    )}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                      className="px-3 py-1.5 text-xs rounded-lg font-medium disabled:opacity-30"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                      Next
                    </button>
                    <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
                      className="px-2.5 py-1.5 text-xs rounded-lg font-medium disabled:opacity-30"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                      »
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
