import React from "react";

/**
 * Seso Checkbox — square check used in table row selectors and forms.
 * Controlled via `checked` + `onChange`, like a native checkbox.
 */
export function Checkbox({ checked = false, indeterminate = false, disabled = false, label, onChange, style, ...rest }) {
  const box = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    flex: "none",
    borderRadius: "var(--radius-xs)",
    border: `1.5px solid ${checked || indeterminate ? "var(--action)" : "var(--border-strong)"}`,
    background: checked || indeterminate ? "var(--action)" : "var(--surface)",
    transition: "background var(--duration-fast), border-color var(--duration-fast)",
  };
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        {...rest}
      />
      <span style={box} aria-hidden="true">
        {indeterminate ? (
          <span style={{ width: 9, height: 2, background: "#fff", borderRadius: 1 }} />
        ) : checked ? (
          <svg viewBox="0 0 16 16" width="12" height="12">
            <path d="M3.5 8.4l2.7 2.7L12.5 5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      {label ? <span style={{ font: "var(--type-body)", color: "var(--text-body)" }}>{label}</span> : null}
    </label>
  );
}
