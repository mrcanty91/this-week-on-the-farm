import React from "react";

/**
 * Seso StatusIndicator — icon + label used inside data tables and detail
 * rows (e.g. "✓ Uploaded", "! Actions…", "○ Delivered").
 * Ships sensible default glyphs per tone; pass `icon` to override.
 */
export function StatusIndicator({ tone = "success", label, icon, style, ...rest }) {
  const map = {
    success: { color: "var(--success)" },
    warning: { color: "var(--warning-icon)" },
    pending: { color: "var(--pending)" },
    info:    { color: "var(--info)" },
    danger:  { color: "var(--danger)" },
  };
  const c = map[tone] || map.success;

  const defaults = {
    success: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill={c.color} />
        <path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill={c.color} />
        <path d="M8 4v4.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="8" cy="11.4" r="1" fill="#fff" />
      </svg>
    ),
    pending: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="8" r="7.2" fill="none" stroke={c.color} strokeWidth="1.6" />
        <path d="M5 8.2l2 2 3.8-3.8" fill="none" stroke={c.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="8" r="7.2" fill="none" stroke={c.color} strokeWidth="1.6" />
      </svg>
    ),
    danger: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill={c.color} />
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        color: "var(--text-body)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ display: "inline-flex", flex: "none" }}>{icon || defaults[tone] || defaults.success}</span>
      {label}
    </span>
  );
}
