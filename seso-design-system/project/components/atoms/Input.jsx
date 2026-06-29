import React from "react";

/**
 * Seso Input — single-line text field. 40px tall, hairline border,
 * blue focus ring. Supports invalid state and leading/trailing adornments.
 */
export function Input({ invalid = false, disabled = false, prefix, suffix, style, ...rest }) {
  const wrap = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: "var(--field-height)",
    padding: "0 12px",
    background: disabled ? "var(--gray-50)" : "var(--surface)",
    border: `1px solid ${invalid ? "var(--danger)" : "var(--border-strong)"}`,
    borderRadius: "var(--radius-md)",
    color: "var(--text-body)",
    transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
  };
  return (
    <div className="seso-input" style={{ ...wrap, ...style }} data-invalid={invalid || undefined}>
      {prefix ? <span style={{ display: "inline-flex", color: "var(--text-muted)" }}>{prefix}</span> : null}
      <input
        disabled={disabled}
        style={{
          flex: 1,
          minWidth: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          font: "var(--type-body)",
          fontSize: "var(--text-md)",
          color: "inherit",
        }}
        {...rest}
      />
      {suffix ? <span style={{ display: "inline-flex", color: "var(--text-muted)" }}>{suffix}</span> : null}
    </div>
  );
}
