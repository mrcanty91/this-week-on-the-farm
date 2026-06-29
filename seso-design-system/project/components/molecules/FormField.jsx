import React from "react";

/**
 * Seso FormField — label + control + helper/error wrapper.
 * Pairs with Input / Select. Standard vertical form rhythm.
 */
export function FormField({ label, htmlFor, helper, error, required = false, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label ? (
        <label
          htmlFor={htmlFor}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--text-heading)",
          }}
        >
          {label}
          {required ? <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--danger)" }}>{error}</span>
      ) : helper ? (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{helper}</span>
      ) : null}
    </div>
  );
}
