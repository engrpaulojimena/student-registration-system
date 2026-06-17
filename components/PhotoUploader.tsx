"use client";

import { useRef, useState } from "react";

interface Props {
  studentId: number;
  currentPhotoUrl: string | null;
  initials: string;
}

export default function PhotoUploader({ studentId, currentPhotoUrl, initials }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError("");
    setSuccess(false);

    const form = new FormData();
    form.append("photo", file);
    form.append("studentId", String(studentId));

    const res = await fetch("/api/students/photo", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }

    setPhotoUrl(data.photoUrl + "?t=" + Date.now());
    setSuccess(true);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex items-start gap-6">
      {/* Preview */}
      <div className="shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Student photo"
            className="w-24 h-24 rounded-2xl object-cover"
            style={{ border: "2px solid var(--border)" }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))",
              color: "#A78BFA",
              border: "2px solid var(--border)",
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Upload area */}
      <div className="flex-1">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl px-5 py-5 cursor-pointer transition-all text-center"
          style={{
            border: "2px dashed var(--border)",
            background: "var(--bg-elevated)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-violet-bright)";
            (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              <span className="text-sm">Uploading…</span>
            </div>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="mx-auto mb-2" style={{ color: "var(--text-muted)" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {photoUrl ? "Change photo" : "Upload photo"}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Drag & drop or click · JPG, PNG, WebP · Max 5MB
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />

        {error && (
          <p className="mt-2 text-xs" style={{ color: "#F87171" }}>{error}</p>
        )}
        {success && (
          <p className="mt-2 text-xs flex items-center gap-1" style={{ color: "#34D399" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Photo updated successfully
          </p>
        )}
      </div>
    </div>
  );
}
