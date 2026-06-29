import React from "react";

/**
 * Seso StatField — a labeled metadata cell. Used in the worker header
 * strip (Type / Status / ID / Date of birth / SSN / Crew).
 */
export function StatField({ label, children, mono = false, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--weight-semibold)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: "var(--text-base)",
          fontWeight: "var(--weight-semibold)",
          color: "var(--text-heading)",
          fontFeatureSettings: mono ? '"tnum"' : undefined,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {children}
      </span>
    </div>
  );
}
