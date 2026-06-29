import React from "react";

/**
 * Seso TopBar — sticky page header. `left` typically holds a Breadcrumb,
 * `right` holds account actions / links. White with a hairline base.
 */
export function TopBar({ left, right, style }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        height: "var(--topbar-height)",
        padding: "0 var(--gutter)",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border-hairline)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>{left}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flex: "none" }}>{right}</div>
    </header>
  );
}
