import React from "react";

/**
 * Seso Select — native dropdown styled to match Input, with a chevron.
 */
export function Select({ options = [], disabled = false, invalid = false, style, children, ...rest }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: "var(--field-height)",
        background: disabled ? "var(--gray-50)" : "var(--surface)",
        border: `1px solid ${invalid ? "var(--danger)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-md)",
        ...style,
      }}
    >
      <select
        disabled={disabled}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          flex: 1,
          height: "100%",
          padding: "0 36px 0 12px",
          border: "none",
          outline: "none",
          background: "transparent",
          font: "var(--type-body)",
          fontSize: "var(--text-md)",
          color: "var(--text-body)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        {...rest}
      >
        {children || options.map((o) => {
          const value = typeof o === "string" ? o : o.value;
          const label = typeof o === "string" ? o : o.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
      <svg
        viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"
        style={{ position: "absolute", right: 12, pointerEvents: "none", color: "var(--text-muted)" }}
      >
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
