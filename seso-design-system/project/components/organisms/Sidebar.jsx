import React from "react";
import { SidebarItem } from "../molecules/SidebarItem.jsx";

/**
 * Seso Sidebar — the dark app navigation rail. Brand header (logo +
 * company) on top, primary nav, optional footer nav pinned to the bottom.
 */
export function Sidebar({
  logoSrc,
  brand = "Seso",
  company,
  items = [],
  footerItems = [],
  active,
  onSelect,
  width,
  style,
}) {
  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        width: width || "var(--sidebar-width)",
        flex: "none",
        height: "100%",
        background: "var(--surface-dark)",
        color: "var(--text-on-dark)",
        padding: 12,
        ...style,
      }}
    >
      {/* Brand header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 16px" }}>
        {logoSrc ? (
          <img src={logoSrc} alt="" style={{ width: 34, height: 34, flex: "none" }} />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-bold)", fontSize: "var(--text-md)" }}>{brand}</span>
          {company ? (
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-on-dark-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{company}</span>
          ) : null}
        </div>
      </div>

      {/* Primary nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((it) => (
          <SidebarItem
            key={it.id}
            icon={it.icon}
            label={it.label}
            active={it.id === active}
            onClick={() => onSelect && onSelect(it.id)}
          />
        ))}
      </nav>

      {/* Footer nav */}
      {footerItems.length ? (
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "auto" }}>
          {footerItems.map((it) => (
            <SidebarItem
              key={it.id}
              icon={it.icon}
              label={it.label}
              active={it.id === active}
              onClick={() => onSelect && onSelect(it.id)}
            />
          ))}
        </nav>
      ) : null}
    </aside>
  );
}
