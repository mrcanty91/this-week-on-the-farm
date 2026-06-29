import React from "react";

/**
 * Seso Tag — chip for taxonomy values (crews, contracts, filters).
 * Optional onRemove turns it into a dismissible filter chip.
 */
export function Tag({ children, onRemove, color = "neutral", style, ...rest }) {
  const map = {
    neutral: { fg: "var(--gray-700)", bg: "var(--gray-100)" },
    green: { fg: "var(--green-700)", bg: "var(--green-100)" },
    blue: { fg: "var(--blue-700)", bg: "var(--blue-100)" },
  };
  const c = map[color] || map.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 24,
        padding: onRemove ? "0 4px 0 10px" : "0 10px",
        borderRadius: "var(--radius-pill)",
        background: c.bg,
        color: c.fg,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-medium)",
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            border: "none",
            borderRadius: "50%",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontSize: 12,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
