import React from "react";

/**
 * Seso Badge — compact pill label for type / status metadata.
 * Tints map to the semantic color set (green H-2A badge, etc.).
 */
export function Badge({ tone = "neutral", solid = false, dot = false, children, style, ...rest }) {
  const map = {
    neutral: { fg: "var(--gray-700)", bg: "var(--gray-100)", solidBg: "var(--gray-600)" },
    green:   { fg: "var(--green-700)", bg: "var(--green-100)", solidBg: "var(--green-600)" },
    blue:    { fg: "var(--blue-700)", bg: "var(--blue-100)", solidBg: "var(--blue-600)" },
    amber:   { fg: "var(--warning)", bg: "var(--warning-bg)", solidBg: "var(--warning-icon)" },
    red:     { fg: "var(--danger)", bg: "var(--danger-bg)", solidBg: "var(--danger)" },
  };
  const c = map[tone] || map.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 22,
        padding: "0 8px",
        borderRadius: "var(--radius-xs)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semibold)",
        lineHeight: 1,
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
        color: solid ? "#fff" : c.fg,
        background: solid ? c.solidBg : c.bg,
        ...style,
      }}
      {...rest}
    >
      {dot ? (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: solid ? "#fff" : c.solidBg }} />
      ) : null}
      {children}
    </span>
  );
}
