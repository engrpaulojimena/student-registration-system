"use client";

export default function PrintTriggerButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: "8px 16px",
        background: "#7c3aed",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
      }}
      className="no-print"
    >
      🖨️ Print
    </button>
  );
}
