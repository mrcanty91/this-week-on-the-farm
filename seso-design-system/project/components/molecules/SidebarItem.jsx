import React from "react";

/**
 * Seso SidebarItem — a navigation row for the dark app sidebar.
 * Active row gets the lighter navy fill + white text.
 */
export function SidebarItem({ icon, label, active = false, collapsed = false, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        height: 40,
        padding: collapsed ? "0" : "0 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        border: "none",
        borderRadius: "var(--radius-md)",
        background: active ? "var(--surface-dark-active)" : "transparent",
        color: active ? "var(--text-on-dark)" : "var(--text-on-dark-muted)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
        textAlign: "left",
        transition: "background var(--duration-fast), color var(--duration-fast)",
      }}
    >
      <span style={{ display: "inline-flex", width: 20, height: 20, flex: "none", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      {collapsed ? null : <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
    </button>
  );
}
