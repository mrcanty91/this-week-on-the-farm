import React from "react";

/**
 * Seso Card — white surface container with optional header (title + actions).
 * The default product container: hairline border, soft radius, light shadow.
 */
export function Card({ title, subtitle, actions, padded = true, children, style, bodyStyle, ...rest }) {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
        ...style,
      }}
      {...rest}
    >
      {title || actions ? (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-hairline)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {title ? (
              <h3 style={{ font: "var(--type-heading)", fontSize: "var(--text-lg)", color: "var(--text-heading)" }}>{title}</h3>
            ) : null}
            {subtitle ? (
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{subtitle}</span>
            ) : null}
          </div>
          {actions ? <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>{actions}</div> : null}
        </header>
      ) : null}
      <div style={{ padding: padded ? "20px" : 0, ...bodyStyle }}>{children}</div>
    </section>
  );
}
