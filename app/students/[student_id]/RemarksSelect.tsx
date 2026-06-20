"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const remarksColors: Record<string, { bg: string; color: string; border: string }> = {
  "Passed":      { bg: "rgba(16,185,129,0.1)",  color: "#34D399", border: "rgba(16,185,129,0.3)" },
  "Failed":      { bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
  "Incomplete":  { bg: "rgba(217,119,6,0.1)",   color: "#fbbf24", border: "rgba(217,119,6,0.3)" },
  "Dropped":     { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", border: "rgba(107,114,128,0.3)" },
  "In Progress": { bg: "rgba(124,58,237,0.1)",  color: "#a78bfa", border: "rgba(124,58,237,0.3)" },
};

const OPTIONS = ["In Progress", "Passed", "Failed", "Incomplete", "Dropped"];

interface RemarksSelectProps {
  enrollmentSubjectId: number;
  value: string;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
}

export default function RemarksSelect({
  enrollmentSubjectId,
  value,
  prelimGrade,
  midtermGrade,
  finalGrade,
}: RemarksSelectProps) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [saving, setSaving]   = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function save(newRemarks: string) {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentSubjectId,
          prelimGrade,
          midtermGrade,
          finalGrade,
          remarks: newRemarks,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Failed to save");
        return;
      }

      const data = await res.json();
      setCurrent(data.remarks ?? newRemarks);
      router.refresh();
    } catch {
      setErrorMsg("Network error");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  const rc = remarksColors[current] ?? remarksColors["In Progress"];

  if (editing) {
    return (
      <select
        autoFocus
        defaultValue={current}
        disabled={saving}
        onChange={(e) => save(e.target.value)}
        onBlur={() => setEditing(false)}
        className="text-xs font-medium px-2.5 py-1 rounded-full outline-none"
        style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
        style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
        title="Click to change"
      >
        {saving ? "Saving..." : current}
      </button>
      {errorMsg && (
        <span className="text-[10px]" style={{ color: "#f87171" }}>{errorMsg}</span>
      )}
    </div>
  );
}
