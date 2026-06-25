"use client";

import { useState } from "react";

interface ExportRow {
  school_year:   string;
  semester:      number;
  subject_code:  string;
  subject_name:  string;
  prelim_grade:  number | string;
  midterm_grade: number | string;
  final_grade:   number | string;
  remarks:       string;
}

interface Props {
  student: {
    student_no:  string;
    first_name:  string;
    last_name:   string;
    course_code: string;
  };
  data: ExportRow[];
}

export default function ExportButton({ student, data }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const XLSX = await import("xlsx");

      // Build worksheet rows
      const rows = [
        // Header info
        ["Student Name:", `${student.first_name} ${student.last_name}`],
        ["Student No:",   student.student_no],
        ["Course:",       student.course_code],
        ["Exported:",     new Date().toLocaleDateString("en-PH")],
        [],
        // Column headers
        ["School Year", "Semester", "Subject Code", "Subject Name", "Prelim Grade", "Midterm Grade", "Final Grade", "Remarks"],
        // Data rows
        ...data.map((r) => [
          r.school_year,
          `Semester ${r.semester}`,
          r.subject_code,
          r.subject_name,
          r.prelim_grade,
          r.midterm_grade,
          r.final_grade,
          r.remarks,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Column widths
      ws["!cols"] = [
        { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 13 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Grades");

      const filename = `${student.student_no}_${student.last_name}_grades.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || data.length === 0}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
      style={{ background: "rgba(16,185,129,0.1)", color: "#34D399", border: "1px solid rgba(16,185,129,0.3)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {loading ? "Exporting..." : "Export Excel"}
    </button>
  );
}
