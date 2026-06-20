"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface GradeCellProps {
  enrollmentSubjectId: number;
  field: "prelim" | "midterm" | "final";
  value: number | null;
  /** Current values of the OTHER grade fields, so saving one field never blanks the others. */
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  remarks: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function GradeCell({
  enrollmentSubjectId,
  field,
  value,
  prelimGrade,
  midtermGrade,
  finalGrade,
  remarks,
}: GradeCellProps) {
  const [editing, setEditing]   = useState(false);
  const [current, setCurrent]   = useState<string>(value !== null ? String(value) : "");
  const [state, setState]       = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const savingRef  = useRef(false); // guards against double-fire (Enter triggers blur too)
  const lastSavedRef = useRef<string>(current);
  const router = useRouter();

  async function save(newVal: string) {
    // Prevent the Enter-key save and the blur-triggered save from both
    // firing for the same edit — without this, refreshing right after a
    // fast Enter+blur could land on whichever request happened to finish
    // last, occasionally appearing to "lose" a grade that was just typed.
    if (savingRef.current) return;

    // Nothing changed — don't hit the network or reset the "saved" badge.
    if (newVal === lastSavedRef.current) {
      setEditing(false);
      return;
    }

    savingRef.current = true;
    setState("saving");
    setErrorMsg(null);

    // Start from the existing values for ALL three fields, then override
    // only the one this cell is responsible for. This is what prevents
    // saving one grade from wiping out the others.
    const payload = {
      enrollmentSubjectId,
      prelimGrade:  field === "prelim"  ? (newVal === "" ? null : newVal) : prelimGrade,
      midtermGrade: field === "midterm" ? (newVal === "" ? null : newVal) : midtermGrade,
      finalGrade:   field === "final"   ? (newVal === "" ? null : newVal) : finalGrade,
      remarks,
    };

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Failed to save. Click to retry.");
        setState("error");
        setEditing(false);
        savingRef.current = false;
        return;
      }

      setCurrent(newVal);
      lastSavedRef.current = newVal;
      setState("saved");
      router.refresh();
    } catch {
      setErrorMsg("Network error. Click to retry.");
      setState("error");
    } finally {
      setEditing(false);
      savingRef.current = false;
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        max="100"
        step="0.01"
        defaultValue={current}
        autoFocus
        disabled={state === "saving"}
        className="w-20 px-2 py-1 rounded-lg text-sm text-center outline-none"
        style={{ background: "var(--bg-base)", border: "1px solid #7C3AED", color: "var(--text-primary)" }}
        onBlur={(e) => save(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur(); // routes through the same save() guard above
          }
          if (e.key === "Escape") setEditing(false);
        }}
      />
    );
  }

  const isSaving = state === "saving";
  const isSaved  = state === "saved";
  const isError  = state === "error";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => { setEditing(true); setErrorMsg(null); if (state !== "saving") setState("idle"); }}
        disabled={isSaving}
        className="w-20 px-2 py-1 rounded-lg text-xs text-center transition-all flex items-center justify-center gap-1"
        style={{
          background: isSaved
            ? "rgba(52,211,153,0.1)"
            : current ? "rgba(124,58,237,0.08)" : "var(--bg-elevated)",
          border: `1px solid ${isSaved ? "#34D399" : isError ? "#f87171" : "var(--border)"}`,
          color: current ? "var(--text-primary)" : "var(--text-muted)",
          cursor: isSaving ? "wait" : "pointer",
          opacity: isSaving ? 0.7 : 1,
        }}
        title={errorMsg ?? (isSaved ? "Saved" : "Click to edit")}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M22 12a10 10 0 0 0-10-10" />
            </svg>
            <span style={{ fontSize: "10px" }}>Saving</span>
          </>
        ) : isSaved ? (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{current !== "" ? current : "—"}</span>
          </>
        ) : (
          <span className="text-sm">{current !== "" ? current : "—"}</span>
        )}
      </button>
      {errorMsg && (
        <span className="text-[10px] text-center leading-tight" style={{ color: "#f87171", maxWidth: "80px" }}>
          {errorMsg}
        </span>
      )}
    </div>
  );
}