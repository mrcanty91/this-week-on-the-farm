import React from "react";

/**
 * Seso Avatar — worker / user image with initials fallback.
 * Worker photos in the app use a rounded square ("rounded"); user/account
 * chips use "circle".
 */
export function Avatar({ src, name = "", size = 40, shape = "circle", style, ...rest }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const radius = shape === "rounded" ? "var(--radius-md)" : shape === "square" ? "var(--radius-xs)" : "var(--radius-full)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flex: "none",
        borderRadius: radius,
        overflow: "hidden",
        background: "var(--green-100)",
        color: "var(--green-700)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--weight-bold)",
        fontSize: Math.max(11, Math.round(size * 0.38)),
        lineHeight: 1,
        userSelect: "none",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials || "?"
      )}
    </span>
  );
}
