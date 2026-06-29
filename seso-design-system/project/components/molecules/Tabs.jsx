import React from "react";

/**
 * Seso Tabs — horizontal section tabs with the blue active underline
 * (Profile / Contracts / Employment log / Notes).
 */
export function Tabs({ items = [], value, onChange, style }) {
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 24,
        borderBottom: "1px solid var(--border-hairline)",
        ...style,
      }}
    >
      {items.map((it) => {
        const id = typeof it === "string" ? it : it.value;
        const label = typeof it === "string" ? it : it.label;
        const active = id === value;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(id)}
            style={{
              position: "relative",
              padding: "10px 0 12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-base)",
              fontWeight: active ? "var(--weight-bold)" : "var(--weight-medium)",
              color: active ? "var(--text-heading)" : "var(--text-muted)",
              transition: "color var(--duration-fast)",
            }}
          >
            {label}
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -1,
                height: "var(--border-width-thick)",
                background: active ? "var(--action)" : "transparent",
                borderRadius: "2px 2px 0 0",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
