import React from "react";

/**
 * Seso Button — the primary interactive control.
 * Primary = action blue (#1D68BB). Secondary = white w/ hairline border.
 * Ghost = text-only. Danger = destructive red.
 */
export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: { height: 32, padding: "0 12px", font: "var(--text-sm)", gap: 6, radius: "var(--radius-sm)" },
    md: { height: 36, padding: "0 16px", font: "var(--text-base)", gap: 8, radius: "var(--radius-md)" },
    lg: { height: 44, padding: "0 20px", font: "var(--text-md)", gap: 8, radius: "var(--radius-md)" },
  };
  const variants = {
    primary: { background: "var(--action)", color: "var(--action-text)", border: "1px solid var(--action)" },
    secondary: { background: "var(--surface)", color: "var(--text-body)", border: "1px solid var(--border-strong)" },
    ghost: { background: "transparent", color: "var(--text-link)", border: "1px solid transparent" },
    brand: { background: "var(--brand)", color: "var(--text-on-brand)", border: "1px solid var(--brand)" },
    danger: { background: "var(--danger)", color: "#fff", border: "1px solid var(--danger)" },
  };
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`seso-btn seso-btn--${variant}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        width: fullWidth ? "100%" : "auto",
        font: "var(--type-label)",
        fontFamily: "var(--font-sans)",
        fontSize: s.font,
        fontWeight: "var(--weight-semibold)",
        lineHeight: 1,
        whiteSpace: "nowrap",
        borderRadius: s.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast)",
        ...v,
        ...style,
      }}
      {...rest}
    >
      {iconLeft ? <span style={{ display: "inline-flex", width: "1em", height: "1em" }}>{iconLeft}</span> : null}
      {children}
      {iconRight ? <span style={{ display: "inline-flex", width: "1em", height: "1em" }}>{iconRight}</span> : null}
    </button>
  );
}
