import React from "react";

/**
 * Seso Breadcrumb — page location trail (Workers › Jose Hernandez).
 * Last item renders as the current (non-link) page.
 */
export function Breadcrumb({ items = [], style }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", ...style }}
    >
      {items.map((it, i) => {
        const last = i === items.length - 1;
        const label = typeof it === "string" ? it : it.label;
        const href = typeof it === "string" ? undefined : it.href;
        return (
          <React.Fragment key={i}>
            {last || !href ? (
              <span style={{ color: last ? "var(--text-heading)" : "var(--text-muted)", fontWeight: last ? "var(--weight-semibold)" : "var(--weight-medium)" }}>{label}</span>
            ) : (
              <a href={href} style={{ color: "var(--text-muted)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>{label}</a>
            )}
            {!last ? (
              <span aria-hidden="true" style={{ color: "var(--gray-300)" }}>›</span>
            ) : null}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
