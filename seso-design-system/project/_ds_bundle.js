/* @ds-bundle: {"format":3,"namespace":"SesoDesignSystem_373f56","components":[{"name":"Avatar","sourcePath":"components/atoms/Avatar.jsx"},{"name":"Badge","sourcePath":"components/atoms/Badge.jsx"},{"name":"Button","sourcePath":"components/atoms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/atoms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/atoms/Input.jsx"},{"name":"Select","sourcePath":"components/atoms/Select.jsx"},{"name":"StatusIndicator","sourcePath":"components/atoms/StatusIndicator.jsx"},{"name":"Tag","sourcePath":"components/atoms/Tag.jsx"},{"name":"Breadcrumb","sourcePath":"components/molecules/Breadcrumb.jsx"},{"name":"FormField","sourcePath":"components/molecules/FormField.jsx"},{"name":"SidebarItem","sourcePath":"components/molecules/SidebarItem.jsx"},{"name":"StatField","sourcePath":"components/molecules/StatField.jsx"},{"name":"Tabs","sourcePath":"components/molecules/Tabs.jsx"},{"name":"Card","sourcePath":"components/organisms/Card.jsx"},{"name":"DataTable","sourcePath":"components/organisms/DataTable.jsx"},{"name":"Sidebar","sourcePath":"components/organisms/Sidebar.jsx"},{"name":"TopBar","sourcePath":"components/organisms/TopBar.jsx"}],"sourceHashes":{"components/atoms/Avatar.jsx":"bba78a109f17","components/atoms/Badge.jsx":"af901256bd59","components/atoms/Button.jsx":"ebf44fcfef20","components/atoms/Checkbox.jsx":"182bd2ed8ae0","components/atoms/Input.jsx":"02e042856095","components/atoms/Select.jsx":"9fba1f8e4cd0","components/atoms/StatusIndicator.jsx":"40a1ec452e8c","components/atoms/Tag.jsx":"eff8af52f609","components/molecules/Breadcrumb.jsx":"9d1a6de93a20","components/molecules/FormField.jsx":"fa6c1f9639d4","components/molecules/SidebarItem.jsx":"313726acdfe6","components/molecules/StatField.jsx":"103295d9c029","components/molecules/Tabs.jsx":"b34d4f463e79","components/organisms/Card.jsx":"c8529d6bc24b","components/organisms/DataTable.jsx":"12ffc9accd21","components/organisms/Sidebar.jsx":"d061895cad85","components/organisms/TopBar.jsx":"a64cff2490aa","ui_kits/seso-app/app.jsx":"4d814ecc5dfa","ui_kits/seso-app/data.js":"bc238a4ae82d","ui_kits/seso-app/icons.jsx":"643ae55cdee6","ui_kits/seso-app/screens.jsx":"1dbd1c7ed100","ui_kits/seso-app/shell.jsx":"c50a36f770bc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SesoDesignSystem_373f56 = window.SesoDesignSystem_373f56 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/atoms/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Avatar — worker / user image with initials fallback.
 * Worker photos in the app use a rounded square ("rounded"); user/account
 * chips use "circle".
 */
function Avatar({
  src,
  name = "",
  size = 40,
  shape = "circle",
  style,
  ...rest
}) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const radius = shape === "rounded" ? "var(--radius-md)" : shape === "square" ? "var(--radius-xs)" : "var(--radius-full)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials || "?");
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/atoms/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Badge — compact pill label for type / status metadata.
 * Tints map to the semantic color set (green H-2A badge, etc.).
 */
function Badge({
  tone = "neutral",
  solid = false,
  dot = false,
  children,
  style,
  ...rest
}) {
  const map = {
    neutral: {
      fg: "var(--gray-700)",
      bg: "var(--gray-100)",
      solidBg: "var(--gray-600)"
    },
    green: {
      fg: "var(--green-700)",
      bg: "var(--green-100)",
      solidBg: "var(--green-600)"
    },
    blue: {
      fg: "var(--blue-700)",
      bg: "var(--blue-100)",
      solidBg: "var(--blue-600)"
    },
    amber: {
      fg: "var(--warning)",
      bg: "var(--warning-bg)",
      solidBg: "var(--warning-icon)"
    },
    red: {
      fg: "var(--danger)",
      bg: "var(--danger-bg)",
      solidBg: "var(--danger)"
    }
  };
  const c = map[tone] || map.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: solid ? "#fff" : c.solidBg
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/Badge.jsx", error: String((e && e.message) || e) }); }

// components/atoms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Button — the primary interactive control.
 * Primary = action blue (#1D68BB). Secondary = white w/ hairline border.
 * Ghost = text-only. Danger = destructive red.
 */
function Button({
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
    sm: {
      height: 32,
      padding: "0 12px",
      font: "var(--text-sm)",
      gap: 6,
      radius: "var(--radius-sm)"
    },
    md: {
      height: 36,
      padding: "0 16px",
      font: "var(--text-base)",
      gap: 8,
      radius: "var(--radius-md)"
    },
    lg: {
      height: 44,
      padding: "0 20px",
      font: "var(--text-md)",
      gap: 8,
      radius: "var(--radius-md)"
    }
  };
  const variants = {
    primary: {
      background: "var(--action)",
      color: "var(--action-text)",
      border: "1px solid var(--action)"
    },
    secondary: {
      background: "var(--surface)",
      color: "var(--text-body)",
      border: "1px solid var(--border-strong)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-link)",
      border: "1px solid transparent"
    },
    brand: {
      background: "var(--brand)",
      color: "var(--text-on-brand)",
      border: "1px solid var(--brand)"
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      border: "1px solid var(--danger)"
    }
  };
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    className: `seso-btn seso-btn--${variant}`,
    style: {
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
      ...style
    }
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: "1em",
      height: "1em"
    }
  }, iconLeft) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: "1em",
      height: "1em"
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/Button.jsx", error: String((e && e.message) || e) }); }

// components/atoms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Checkbox — square check used in table row selectors and forms.
 * Controlled via `checked` + `onChange`, like a native checkbox.
 */
function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
  style,
  ...rest
}) {
  const box = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    flex: "none",
    borderRadius: "var(--radius-xs)",
    border: `1.5px solid ${checked || indeterminate ? "var(--action)" : "var(--border-strong)"}`,
    background: checked || indeterminate ? "var(--action)" : "var(--surface)",
    transition: "background var(--duration-fast), border-color var(--duration-fast)"
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: box,
    "aria-hidden": "true"
  }, indeterminate ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 2,
      background: "#fff",
      borderRadius: 1
    }
  }) : checked ? /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    width: "12",
    height: "12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.4l2.7 2.7L12.5 5",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body)",
      color: "var(--text-body)"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/atoms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Input — single-line text field. 40px tall, hairline border,
 * blue focus ring. Supports invalid state and leading/trailing adornments.
 */
function Input({
  invalid = false,
  disabled = false,
  prefix,
  suffix,
  style,
  ...rest
}) {
  const wrap = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: "var(--field-height)",
    padding: "0 12px",
    background: disabled ? "var(--gray-50)" : "var(--surface)",
    border: `1px solid ${invalid ? "var(--danger)" : "var(--border-strong)"}`,
    borderRadius: "var(--radius-md)",
    color: "var(--text-body)",
    transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "seso-input",
    style: {
      ...wrap,
      ...style
    },
    "data-invalid": invalid || undefined
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--text-muted)"
    }
  }, prefix) : null, /*#__PURE__*/React.createElement("input", _extends({
    disabled: disabled,
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--type-body)",
      fontSize: "var(--text-md)",
      color: "inherit"
    }
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--text-muted)"
    }
  }, suffix) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/Input.jsx", error: String((e && e.message) || e) }); }

// components/atoms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Select — native dropdown styled to match Input, with a chevron.
 */
function Select({
  options = [],
  disabled = false,
  invalid = false,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      height: "var(--field-height)",
      background: disabled ? "var(--gray-50)" : "var(--surface)",
      border: `1px solid ${invalid ? "var(--danger)" : "var(--border-strong)"}`,
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    disabled: disabled,
    style: {
      appearance: "none",
      WebkitAppearance: "none",
      flex: 1,
      height: "100%",
      padding: "0 36px 0 12px",
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--type-body)",
      fontSize: "var(--text-md)",
      color: "var(--text-body)",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, rest), children || options.map(o => {
    const value = typeof o === "string" ? o : o.value;
    const label = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, label);
  })), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    width: "16",
    height: "16",
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: 12,
      pointerEvents: "none",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/Select.jsx", error: String((e && e.message) || e) }); }

// components/atoms/StatusIndicator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso StatusIndicator — icon + label used inside data tables and detail
 * rows (e.g. "✓ Uploaded", "! Actions…", "○ Delivered").
 * Ships sensible default glyphs per tone; pass `icon` to override.
 */
function StatusIndicator({
  tone = "success",
  label,
  icon,
  style,
  ...rest
}) {
  const map = {
    success: {
      color: "var(--success)"
    },
    warning: {
      color: "var(--warning-icon)"
    },
    pending: {
      color: "var(--pending)"
    },
    info: {
      color: "var(--info)"
    },
    danger: {
      color: "var(--danger)"
    }
  };
  const c = map[tone] || map.success;
  const defaults = {
    success: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "16",
      height: "16",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "8",
      cy: "8",
      r: "8",
      fill: c.color
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4.5 8.2l2.2 2.2 4.8-4.8",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })),
    warning: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "16",
      height: "16",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "8",
      cy: "8",
      r: "8",
      fill: c.color
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 4v4.4",
      stroke: "#fff",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "8",
      cy: "11.4",
      r: "1",
      fill: "#fff"
    })),
    pending: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "16",
      height: "16",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "8",
      cy: "8",
      r: "7.2",
      fill: "none",
      stroke: c.color,
      strokeWidth: "1.6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 8.2l2 2 3.8-3.8",
      fill: "none",
      stroke: c.color,
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })),
    info: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "16",
      height: "16",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "8",
      cy: "8",
      r: "7.2",
      fill: "none",
      stroke: c.color,
      strokeWidth: "1.6"
    })),
    danger: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "16",
      height: "16",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "8",
      cy: "8",
      r: "8",
      fill: c.color
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.5 5.5l5 5M10.5 5.5l-5 5",
      stroke: "#fff",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }))
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--text-body)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flex: "none"
    }
  }, icon || defaults[tone] || defaults.success), label);
}
Object.assign(__ds_scope, { StatusIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/StatusIndicator.jsx", error: String((e && e.message) || e) }); }

// components/atoms/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Tag — chip for taxonomy values (crews, contracts, filters).
 * Optional onRemove turns it into a dismissible filter chip.
 */
function Tag({
  children,
  onRemove,
  color = "neutral",
  style,
  ...rest
}) {
  const map = {
    neutral: {
      fg: "var(--gray-700)",
      bg: "var(--gray-100)"
    },
    green: {
      fg: "var(--green-700)",
      bg: "var(--green-100)"
    },
    blue: {
      fg: "var(--blue-700)",
      bg: "var(--blue-100)"
    }
  };
  const c = map[color] || map.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), children, onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
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
      lineHeight: 1
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/atoms/Tag.jsx", error: String((e && e.message) || e) }); }

// components/molecules/Breadcrumb.jsx
try { (() => {
/**
 * Seso Breadcrumb — page location trail (Workers › Jose Hernandez).
 * Last item renders as the current (non-link) page.
 */
function Breadcrumb({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      ...style
    }
  }, items.map((it, i) => {
    const last = i === items.length - 1;
    const label = typeof it === "string" ? it : it.label;
    const href = typeof it === "string" ? undefined : it.href;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, last || !href ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: last ? "var(--text-heading)" : "var(--text-muted)",
        fontWeight: last ? "var(--weight-semibold)" : "var(--weight-medium)"
      }
    }, label) : /*#__PURE__*/React.createElement("a", {
      href: href,
      style: {
        color: "var(--text-muted)",
        fontWeight: "var(--weight-medium)",
        textDecoration: "none"
      }
    }, label), !last ? /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        color: "var(--gray-300)"
      }
    }, "\u203A") : null);
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/molecules/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/molecules/FormField.jsx
try { (() => {
/**
 * Seso FormField — label + control + helper/error wrapper.
 * Pairs with Input / Select. Standard vertical form rhythm.
 */
function FormField({
  label,
  htmlFor,
  helper,
  error,
  required = false,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger)",
      marginLeft: 2
    }
  }, "*") : null) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--danger)"
    }
  }, error) : helper ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, helper) : null);
}
Object.assign(__ds_scope, { FormField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/molecules/FormField.jsx", error: String((e && e.message) || e) }); }

// components/molecules/SidebarItem.jsx
try { (() => {
/**
 * Seso SidebarItem — a navigation row for the dark app sidebar.
 * Active row gets the lighter navy fill + white text.
 */
function SidebarItem({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-current": active ? "page" : undefined,
    style: {
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
      transition: "background var(--duration-fast), color var(--duration-fast)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 20,
      height: 20,
      flex: "none",
      alignItems: "center",
      justifyContent: "center"
    }
  }, icon), collapsed ? null : /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: "nowrap"
    }
  }, label));
}
Object.assign(__ds_scope, { SidebarItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/molecules/SidebarItem.jsx", error: String((e && e.message) || e) }); }

// components/molecules/StatField.jsx
try { (() => {
/**
 * Seso StatField — a labeled metadata cell. Used in the worker header
 * strip (Type / Status / ID / Date of birth / SSN / Crew).
 */
function StatField({
  label,
  children,
  mono = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-muted)",
      whiteSpace: "nowrap"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      fontSize: "var(--text-base)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)",
      fontFeatureSettings: mono ? '"tnum"' : undefined,
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, children));
}
Object.assign(__ds_scope, { StatField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/molecules/StatField.jsx", error: String((e && e.message) || e) }); }

// components/molecules/Tabs.jsx
try { (() => {
/**
 * Seso Tabs — horizontal section tabs with the blue active underline
 * (Profile / Contracts / Employment log / Notes).
 */
function Tabs({
  items = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: 24,
      borderBottom: "1px solid var(--border-hairline)",
      ...style
    }
  }, items.map(it => {
    const id = typeof it === "string" ? it : it.value;
    const label = typeof it === "string" ? it : it.label;
    const active = id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(id),
      style: {
        position: "relative",
        padding: "10px 0 12px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: active ? "var(--weight-bold)" : "var(--weight-medium)",
        color: active ? "var(--text-heading)" : "var(--text-muted)",
        transition: "color var(--duration-fast)"
      }
    }, label, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -1,
        height: "var(--border-width-thick)",
        background: active ? "var(--action)" : "transparent",
        borderRadius: "2px 2px 0 0"
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/molecules/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/organisms/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Seso Card — white surface container with optional header (title + actions).
 * The default product container: hairline border, soft radius, light shadow.
 */
function Card({
  title,
  subtitle,
  actions,
  padded = true,
  children,
  style,
  bodyStyle,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-xs)",
      overflow: "hidden",
      ...style
    }
  }, rest), title || actions ? /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "16px 20px",
      borderBottom: "1px solid var(--border-hairline)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-heading)",
      fontSize: "var(--text-lg)",
      color: "var(--text-heading)"
    }
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)"
    }
  }, subtitle) : null), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: "none"
    }
  }, actions) : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padded ? "20px" : 0,
      ...bodyStyle
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/organisms/Card.jsx", error: String((e && e.message) || e) }); }

// components/organisms/DataTable.jsx
try { (() => {
/**
 * Seso DataTable — the workhorse list view (workers, payroll, audit files).
 * Light header, hairline row separators, optional row selection.
 * Columns declare how each cell renders; pass `render(row)` for rich cells.
 */
function DataTable({
  columns = [],
  rows = [],
  selectable = false,
  selected = [],
  onSelect,
  rowKey = "id",
  onRowClick,
  style
}) {
  const allChecked = selectable && rows.length > 0 && selected.length === rows.length;
  const someChecked = selectable && selected.length > 0 && !allChecked;
  const toggleAll = () => {
    if (!onSelect) return;
    onSelect(allChecked ? [] : rows.map(r => r[rowKey]));
  };
  const toggleRow = id => {
    if (!onSelect) return;
    onSelect(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };
  const th = {
    textAlign: "left",
    padding: "10px 16px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-xs)",
    fontWeight: "var(--weight-bold)",
    color: "var(--text-muted)",
    textTransform: "none",
    whiteSpace: "nowrap",
    background: "var(--surface-sunken)",
    borderBottom: "1px solid var(--border)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      overflowX: "auto",
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, selectable ? /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      width: 44
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
    checked: allChecked,
    indeterminate: someChecked,
    onChange: toggleAll
  })) : null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      ...th,
      textAlign: c.align || "left",
      width: c.width
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, c.header, c.sortable ? /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    width: "12",
    height: "12",
    style: {
      color: "var(--gray-400)"
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 3v10M8 3L5.5 5.5M8 3l2.5 2.5M8 13l-2.5-2.5M8 13l2.5-2.5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null))))), /*#__PURE__*/React.createElement("tbody", null, rows.map(row => {
    const id = row[rowKey];
    return /*#__PURE__*/React.createElement("tr", {
      key: id,
      onClick: onRowClick ? () => onRowClick(row) : undefined,
      style: {
        cursor: onRowClick ? "pointer" : "default",
        borderBottom: "1px solid var(--border-hairline)"
      }
    }, selectable ? /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        verticalAlign: "middle"
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement(__ds_scope.Checkbox, {
      checked: selected.includes(id),
      onChange: () => toggleRow(id)
    })) : null, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        padding: "12px 16px",
        verticalAlign: "middle",
        textAlign: c.align || "left",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        fontFamily: c.mono ? "var(--font-mono)" : "var(--font-sans)",
        fontFeatureSettings: c.mono ? '"tnum"' : undefined,
        whiteSpace: c.wrap ? "normal" : "nowrap"
      }
    }, c.render ? c.render(row) : row[c.key])));
  }))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/organisms/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/organisms/Sidebar.jsx
try { (() => {
/**
 * Seso Sidebar — the dark app navigation rail. Brand header (logo +
 * company) on top, primary nav, optional footer nav pinned to the bottom.
 */
function Sidebar({
  logoSrc,
  brand = "Seso",
  company,
  items = [],
  footerItems = [],
  active,
  onSelect,
  width,
  style
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      width: width || "var(--sidebar-width)",
      flex: "none",
      height: "100%",
      background: "var(--surface-dark)",
      color: "var(--text-on-dark)",
      padding: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 8px 16px"
    }
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "",
    style: {
      width: 34,
      height: 34,
      flex: "none"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.2,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-bold)",
      fontSize: "var(--text-md)"
    }
  }, brand), company ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-on-dark-muted)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, company) : null)), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, items.map(it => /*#__PURE__*/React.createElement(__ds_scope.SidebarItem, {
    key: it.id,
    icon: it.icon,
    label: it.label,
    active: it.id === active,
    onClick: () => onSelect && onSelect(it.id)
  }))), footerItems.length ? /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      marginTop: "auto"
    }
  }, footerItems.map(it => /*#__PURE__*/React.createElement(__ds_scope.SidebarItem, {
    key: it.id,
    icon: it.icon,
    label: it.label,
    active: it.id === active,
    onClick: () => onSelect && onSelect(it.id)
  }))) : null);
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/organisms/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/organisms/TopBar.jsx
try { (() => {
/**
 * Seso TopBar — sticky page header. `left` typically holds a Breadcrumb,
 * `right` holds account actions / links. White with a hairline base.
 */
function TopBar({
  left,
  right,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      height: "var(--topbar-height)",
      padding: "0 var(--gutter)",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border-hairline)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0
    }
  }, left), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 20,
      flex: "none"
    }
  }, right));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/organisms/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/seso-app/app.jsx
try { (() => {
/* Seso UI kit — interactive orchestrator. */
(function () {
  const {
    AppShell,
    LoginScreen,
    WorkersScreen,
    WorkerProfileScreen,
    ContractScreen,
    PayrollScreen
  } = window;
  const {
    Card,
    Button
  } = window.SesoDesignSystem_373f56;
  function Placeholder({
    title
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1100,
        margin: "0 auto",
        padding: "28px 32px"
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 28,
        fontWeight: 700,
        marginBottom: 16
      }
    }, title), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px 0",
        textAlign: "center",
        color: "var(--text-muted)"
      }
    }, "This view is part of the Seso platform \u2014 not recreated in this UI kit.")));
  }
  function App() {
    const [authed, setAuthed] = React.useState(false);
    const [nav, setNav] = React.useState("onboarding");
    const [view, setView] = React.useState(null); // 'worker' overlays the workers nav

    if (!authed) return /*#__PURE__*/React.createElement(LoginScreen, {
      onSignIn: () => setAuthed(true)
    });
    const go = id => {
      setNav(id);
      setView(null);
    };
    let content, breadcrumb;
    if (view === "worker") {
      content = /*#__PURE__*/React.createElement(WorkerProfileScreen, null);
      breadcrumb = [{
        label: "Workers",
        href: "#"
      }, "Jose Hernandez"];
    } else if (nav === "workers" || nav === "onboarding") {
      content = /*#__PURE__*/React.createElement(WorkersScreen, {
        onOpenWorker: () => setView("worker")
      });
      breadcrumb = [nav === "onboarding" ? "Onboarding" : "Workers"];
    } else if (nav === "contracts") {
      content = /*#__PURE__*/React.createElement(ContractScreen, null);
      breadcrumb = [{
        label: "Contracts",
        href: "#"
      }, {
        label: "Avocado Harvest",
        href: "#"
      }, "Assigned Workers"];
    } else if (nav === "payroll") {
      content = /*#__PURE__*/React.createElement(PayrollScreen, null);
      breadcrumb = [{
        label: "Payroll",
        href: "#"
      }, {
        label: "Drafts",
        href: "#"
      }, "Avocado Crew"];
    } else {
      const titles = {
        dashboard: "Dashboard",
        paycards: "Paycards",
        settings: "Settings"
      };
      content = /*#__PURE__*/React.createElement(Placeholder, {
        title: titles[nav] || "Seso"
      });
      breadcrumb = [titles[nav] || "Seso"];
    }

    // breadcrumb back-nav: clicking the first "Workers" crumb returns to list
    const bc = breadcrumb.map(c => typeof c === "object" && c.label === "Workers" ? {
      label: "Workers",
      href: "#",
      onClick: () => setView(null)
    } : c);
    return /*#__PURE__*/React.createElement(AppShell, {
      nav: view === "worker" ? "workers" : nav,
      onNav: go,
      breadcrumb: breadcrumb
    }, content);
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/seso-app/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/seso-app/data.js
try { (() => {
/* Seso UI kit — sample data (fictional, mirrors the marketing-site demos). */
window.SesoData = {
  company: "Acme Fruits, Inc.",
  workers: [{
    id: "33516",
    name: "Clinio Canales Linares",
    contract: "Avocado Contract",
    type: "H-2A",
    hire: "May 20",
    i9: "uploaded",
    visa: "uploaded",
    link: "read"
  }, {
    id: "50031",
    name: "Ademaro Madera Carrillo",
    contract: "Orange Contract",
    type: "H-2A",
    hire: "May 20",
    i9: "actions",
    visa: "actions",
    link: "read"
  }, {
    id: "41566",
    name: "Luz Jimenez Galvan",
    contract: "Avocado Contract",
    type: "Domestic",
    hire: "May 22",
    i9: "uploaded",
    visa: "actions",
    link: "delivered"
  }, {
    id: "89557",
    name: "Barela Mercado Ganix",
    contract: "Avocado Contract",
    type: "H-2A",
    hire: "May 22",
    i9: "uploaded",
    visa: "actions",
    link: "read"
  }, {
    id: "29926",
    name: "Renato Mojica Pineda",
    contract: "Orange Contract",
    type: "H-2A",
    hire: "May 23",
    i9: "actions",
    visa: "uploaded",
    link: "read"
  }, {
    id: "46522",
    name: "Rainero Rolon Cardenas",
    contract: "Orange Contract",
    type: "H-2A",
    hire: "May 22",
    i9: "uploaded",
    visa: "actions",
    link: "delivered"
  }],
  worker: {
    id: "18095",
    name: "Jose Hernandez",
    type: "H-2A",
    status: "On Contract",
    dob: "Mar 1, 1993",
    ssn: "•••‑••‑7891",
    crew: "Avocado Crew",
    sex: "Male",
    phone: "+52 (555) 555‑5555",
    email: "josehernandez93@example.com",
    emergency: {
      name: "Rosemary Guevara",
      relationship: "Spouse",
      phone: "+52 (555) 555‑5555"
    }
  },
  contract: {
    name: "Avocado Harvest",
    start: "Jun 29",
    end: "Sep 10",
    workers: "6/6",
    caseNumber: "H‑300‑21152‑359042",
    petitionId: "IOE‑18‑001‑56789",
    consulate: "Monterrey, MX",
    sections: [{
      label: "Housing",
      done: 4,
      total: 5,
      status: "warning"
    }, {
      label: "Transportation",
      done: 10,
      total: 10,
      status: "success"
    }, {
      label: "Contract documents",
      done: 10,
      total: 10,
      status: "success"
    }, {
      label: "Worker information",
      done: null,
      total: null,
      status: "success",
      note: "All worker data added"
    }],
    audits: [{
      date: "Jul 22",
      by: "Carlos F."
    }, {
      date: "Jul 20",
      by: "Bethany R."
    }, {
      date: "Jul 18",
      by: "Jeffrey A."
    }]
  },
  payroll: {
    crew: "Avocado Crew (Weekly)",
    period: "Jul 15 – Jul 21",
    schedule: "Weekly",
    approveBy: "Jul 21, 5:00 PM PDT",
    payday: "Jul 22",
    workers: 20,
    gross: "$42,130.23",
    overtime: "$2,312.64",
    rows: [{
      id: "14530",
      name: "Alen Muniz Contreras",
      method: "Direct deposit",
      hrs: "46.00",
      ot: "6.00",
      gross: "$2,050.80"
    }, {
      id: "31245",
      name: "Anthony Suarez Flores",
      method: "Direct deposit",
      hrs: "40.00",
      ot: "0.00",
      gross: "$1,758.22"
    }, {
      id: "41221",
      name: "Azarias Arana Galarza",
      method: "Direct deposit",
      hrs: "46.00",
      ot: "6.00",
      gross: "$2,050.80"
    }, {
      id: "71923",
      name: "Bowie Anaya Montano",
      method: "Paycard",
      hrs: "40.00",
      ot: "0.00",
      gross: "$1,758.22"
    }, {
      id: "81290",
      name: "Danilo Huerta Lopez",
      method: "Direct deposit",
      hrs: "42.01",
      ot: "2.01",
      gross: "$1,950.41"
    }, {
      id: "91249",
      name: "Elvio Aleman Herrera",
      method: "Direct deposit",
      hrs: "41.55",
      ot: "1.55",
      gross: "$1,901.35"
    }, {
      id: "44712",
      name: "Evaristo Carrasco",
      method: "Paycard",
      hrs: "40.00",
      ot: "0.00",
      gross: "$2,050.80"
    }]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/seso-app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/seso-app/icons.jsx
try { (() => {
/* Seso UI kit — icon set.
   NOTE: line icons approximate Lucide (https://lucide.dev) — the closest
   open match to Seso's clean ~2px stroke set; the real app icons were not
   extractable from the public site. 24×24, stroke 2, round caps/joins. */
(function () {
  const S = (paths, extra) => function Icon(props) {
    const {
      size = 20,
      color = "currentColor",
      strokeWidth = 1.9,
      style,
      ...rest
    } = props || {};
    return React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: color,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style,
      "aria-hidden": "true",
      ...rest
    }, paths.map((d, i) => d.c ? React.createElement("circle", {
      key: i,
      cx: d.c[0],
      cy: d.c[1],
      r: d.c[2]
    }) : React.createElement("path", {
      key: i,
      d
    })));
  };
  const Icons = {
    LayoutDashboard: S(["M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"]),
    Users: S(["M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M22 19v-2a4 4 0 0 0-3-3.87", {
      c: [9, 7, 4]
    }, "M16 3.1a4 4 0 0 1 0 7.8"]),
    FileText: S(["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5", "M9 13h6", "M9 17h6"]),
    DollarSign: S(["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]),
    CreditCard: S(["M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z", "M2 10h20"]),
    Briefcase: S(["M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z", "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M3 12h18"]),
    Settings: S([{
      c: [12, 12, 3]
    }, "M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 6.8 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.6H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 .9 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"]),
    Bell: S(["M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.7 21a2 2 0 0 1-3.4 0"]),
    Search: S([{
      c: [11, 11, 7]
    }, "M21 21l-4.3-4.3"]),
    ChevronRight: S(["M9 6l6 6-6 6"]),
    Plus: S(["M12 5v14", "M5 12h14"]),
    MoreHorizontal: S([{
      c: [5, 12, 1]
    }, {
      c: [12, 12, 1]
    }, {
      c: [19, 12, 1]
    }]),
    LogOut: S(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]),
    AtSign: S([{
      c: [12, 12, 4]
    }, "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"]),
    Calendar: S(["M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "M16 3v4", "M8 3v4", "M4 10h16"]),
    MapPin: S(["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z", {
      c: [12, 10, 3]
    }]),
    Home: S(["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5"]),
    ExternalLink: S(["M15 3h6v6", "M10 14 21 3", "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"]),
    Download: S(["M12 3v12", "M7 10l5 5 5-5", "M5 21h14"]),
    Play: S(["M6 4l14 8-14 8z"]),
    Globe: S([{
      c: [12, 12, 9]
    }, "M3 12h18", "M12 3a14 14 0 0 1 0 18", "M12 3a14 14 0 0 0 0 18"]),
    Clock: S([{
      c: [12, 12, 9]
    }, "M12 7v5l3 2"])
  };
  window.SesoIcons = Icons;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/seso-app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/seso-app/screens.jsx
try { (() => {
/* Seso UI kit — screens (Login, Workers, Worker profile, Contract, Payroll). */
(function () {
  const D = window.SesoDesignSystem_373f56;
  const {
    Button,
    Badge,
    StatusIndicator,
    Tag,
    Input,
    Select,
    Checkbox,
    Avatar,
    Tabs,
    StatField,
    FormField,
    Card,
    DataTable
  } = D;
  const I = window.SesoIcons;
  const statusCell = code => {
    const m = {
      uploaded: /*#__PURE__*/React.createElement(StatusIndicator, {
        tone: "success",
        label: "Uploaded"
      }),
      actions: /*#__PURE__*/React.createElement(StatusIndicator, {
        tone: "warning",
        label: "Actions\u2026"
      }),
      read: /*#__PURE__*/React.createElement(StatusIndicator, {
        tone: "success",
        label: "Read"
      }),
      delivered: /*#__PURE__*/React.createElement(StatusIndicator, {
        tone: "pending",
        label: "Delivered"
      })
    };
    return m[code] || null;
  };
  const PAGE = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 32px"
  };

  /* ---------------- LOGIN ---------------- */
  function LoginScreen({
    onSignIn
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        height: "100%",
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: "1 1 46%",
        background: "var(--brand)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 48
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logo-lockup.png",
      alt: "Seso",
      style: {
        height: 44,
        alignSelf: "flex-start"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        color: "#fff",
        fontSize: 40,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        maxWidth: 420
      }
    }, "Run your season with Seso"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "rgba(255,255,255,.82)",
        fontSize: 17,
        marginTop: 16,
        maxWidth: 380
      }
    }, "The all-in-one system for farmers to hire, manage, and retain a reliable workforce.")), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "rgba(255,255,255,.7)",
        fontSize: 13
      }
    }, "\xA9 2026 Seso, Inc.")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: "1 1 54%",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32
      }
    }, /*#__PURE__*/React.createElement("form", {
      onSubmit: e => {
        e.preventDefault();
        onSignIn && onSignIn();
      },
      style: {
        width: "100%",
        maxWidth: 380,
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 26,
        fontWeight: 700
      }
    }, "Sign in"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 6,
        fontSize: 14
      }
    }, "Welcome back. Sign in to manage your season.")), /*#__PURE__*/React.createElement(FormField, {
      label: "Work email",
      htmlFor: "email"
    }, /*#__PURE__*/React.createElement(Input, {
      id: "email",
      type: "email",
      defaultValue: "kim@acmefruits.com",
      prefix: /*#__PURE__*/React.createElement(I.AtSign, {
        size: 16
      })
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Password",
      htmlFor: "pw"
    }, /*#__PURE__*/React.createElement(Input, {
      id: "pw",
      type: "password",
      defaultValue: "password"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      checked: true,
      label: "Remember me",
      onChange: () => {}
    }), /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "Forgot password?")), /*#__PURE__*/React.createElement(Button, {
      type: "submit",
      variant: "primary",
      size: "lg",
      fullWidth: true
    }, "Sign in"), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 13,
        color: "var(--text-muted)"
      }
    }, "Are you a worker? ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        fontWeight: 600
      }
    }, "Go to the worker app")))));
  }

  /* ---------------- WORKERS / ONBOARDING ---------------- */
  function WorkersScreen({
    onOpenWorker
  }) {
    const data = window.SesoData.workers;
    const [sel, setSel] = React.useState([]);
    const columns = [{
      key: "name",
      header: "Name",
      sortable: true,
      wrap: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        }
      }, /*#__PURE__*/React.createElement("a", {
        href: "#",
        onClick: e => {
          e.preventDefault();
          onOpenWorker && onOpenWorker();
        },
        style: {
          fontWeight: 600
        }
      }, r.name), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-muted)",
          fontSize: "var(--text-xs)"
        }
      }, r.contract))
    }, {
      key: "id",
      header: "ID",
      mono: true,
      sortable: true
    }, {
      key: "hire",
      header: "Hire date",
      sortable: true
    }, {
      key: "i9",
      header: "I-94",
      render: r => statusCell(r.i9)
    }, {
      key: "visa",
      header: "H-2A visa",
      render: r => statusCell(r.visa)
    }, {
      key: "link",
      header: "Link status",
      render: r => statusCell(r.link)
    }, {
      key: "act",
      header: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          justifyContent: "flex-end"
        }
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary"
      }, "Send link"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconRight: /*#__PURE__*/React.createElement(I.ExternalLink, {
          size: 13
        })
      }, "Open packet"))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: PAGE
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 16,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 28,
        fontWeight: 700
      }
    }, "Workers"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 4,
        fontSize: 14
      }
    }, "Digital onboarding \u2014 ", data.length, " workers in progress")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 220
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Search workers",
      prefix: /*#__PURE__*/React.createElement(I.Search, {
        size: 16
      })
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(I.Plus, {
        size: 15
      })
    }, "Add worker"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      color: "green"
    }, "All crews"), /*#__PURE__*/React.createElement(Tag, {
      color: "neutral",
      onRemove: () => {}
    }, "Avocado Contract"), /*#__PURE__*/React.createElement(Tag, {
      color: "neutral",
      onRemove: () => {}
    }, "Needs action")), /*#__PURE__*/React.createElement(Card, {
      padded: false
    }, /*#__PURE__*/React.createElement(DataTable, {
      columns: columns,
      rows: data,
      selectable: true,
      selected: sel,
      onSelect: setSel,
      onRowClick: () => onOpenWorker && onOpenWorker()
    })));
  }

  /* ---------------- WORKER PROFILE ---------------- */
  function WorkerProfileScreen() {
    const w = window.SesoData.worker;
    const [tab, setTab] = React.useState("Profile");
    const [sub, setSub] = React.useState("Basic info & contact");
    const subnav = ["Basic info & contact", "Identification", "Employment & payroll", "Benefits & deductions", "All documents"];
    return /*#__PURE__*/React.createElement("div", {
      style: PAGE
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 20,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: w.name,
      shape: "rounded",
      size: 68,
      src: "../../assets/worker-face.png"
    }), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: "-0.01em",
        flex: 1,
        minWidth: 0
      }
    }, w.name), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconRight: /*#__PURE__*/React.createElement(I.MoreHorizontal, {
        size: 16
      })
    }, "Actions")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 40,
        marginTop: 18,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(StatField, {
      label: "Type"
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "green"
    }, w.type)), /*#__PURE__*/React.createElement(StatField, {
      label: "Status"
    }, /*#__PURE__*/React.createElement(StatusIndicator, {
      tone: "success",
      icon: /*#__PURE__*/React.createElement(I.Play, {
        size: 15,
        color: "var(--success)"
      }),
      label: w.status
    })), /*#__PURE__*/React.createElement(StatField, {
      label: "ID",
      mono: true
    }, w.id), /*#__PURE__*/React.createElement(StatField, {
      label: "Date of birth"
    }, w.dob), /*#__PURE__*/React.createElement(StatField, {
      label: "SSN",
      mono: true
    }, w.ssn, " ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        fontWeight: 600,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        marginLeft: 4
      }
    }, "Show")), /*#__PURE__*/React.createElement(StatField, {
      label: "Crew"
    }, w.crew)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      items: ["Profile", "Contracts", "Employment log", "Notes"],
      value: tab,
      onChange: setTab
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 32,
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderLeft: "1px solid var(--border)"
      }
    }, subnav.map(s => {
      const active = s === sub;
      return /*#__PURE__*/React.createElement("button", {
        key: s,
        onClick: () => setSub(s),
        style: {
          textAlign: "left",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "10px 14px",
          marginLeft: -1,
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: active ? 700 : 500,
          color: active ? "var(--text-heading)" : "var(--text-muted)",
          borderLeft: `2px solid ${active ? "var(--action)" : "transparent"}`
        }
      }, s);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(Card, {
      title: "Basic information",
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "ghost"
      }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary"
      }, "Save"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 560
      }
    }, /*#__PURE__*/React.createElement(FormField, {
      label: "Full name"
    }, /*#__PURE__*/React.createElement(Input, {
      defaultValue: w.name
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Employee ID"
    }, /*#__PURE__*/React.createElement(Input, {
      defaultValue: w.id
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Sex"
    }, /*#__PURE__*/React.createElement(Input, {
      defaultValue: w.sex
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Worker type"
    }, /*#__PURE__*/React.createElement(Select, {
      options: ["H-2A", "Domestic", "H-2B"],
      defaultValue: "H-2A"
    })))), /*#__PURE__*/React.createElement(Card, {
      title: "Date of birth",
      subtitle: "Birth certificate",
      actions: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(I.FileText, {
          size: 15
        })
      }, "Edit")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(StatField, {
      label: "Date of birth"
    }, w.dob), /*#__PURE__*/React.createElement(StatField, {
      label: "Document image(s)"
    }, /*#__PURE__*/React.createElement(StatusIndicator, {
      tone: "success",
      label: "1 uploaded"
    })))))));
  }

  /* ---------------- CONTRACT ---------------- */
  function ContractScreen() {
    const c = window.SesoData.contract;
    const [tab, setTab] = React.useState("Audit file");
    const [sub, setSub] = React.useState("Summary");
    const subnav = ["Summary", "Housing", "Transportation", "Documents", "Worker information", "Reimbursements"];
    const auditCols = [{
      key: "date",
      header: "Date generated",
      sortable: true
    }, {
      key: "by",
      header: "Generated by",
      sortable: true
    }, {
      key: "act",
      header: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "ghost",
        iconLeft: /*#__PURE__*/React.createElement(I.Download, {
          size: 14
        })
      }, "Download")
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: PAGE
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: "-0.01em"
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Edit details"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconRight: /*#__PURE__*/React.createElement(I.MoreHorizontal, {
        size: 16
      })
    }, "More"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 40,
        marginTop: 18,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(StatField, {
      label: "Start date"
    }, c.start), /*#__PURE__*/React.createElement(StatField, {
      label: "End date"
    }, c.end), /*#__PURE__*/React.createElement(StatField, {
      label: "Workers",
      mono: true
    }, c.workers), /*#__PURE__*/React.createElement(StatField, {
      label: "Case number",
      mono: true
    }, c.caseNumber), /*#__PURE__*/React.createElement(StatField, {
      label: "USCIS petition ID",
      mono: true
    }, c.petitionId), /*#__PURE__*/React.createElement(StatField, {
      label: "Consulate location"
    }, c.consulate)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      items: ["Timeline", "Audit file", "Assigned Workers", "Recruitment"],
      value: tab,
      onChange: setTab
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 32,
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderLeft: "1px solid var(--border)"
      }
    }, subnav.map(s => {
      const active = s === sub;
      return /*#__PURE__*/React.createElement("button", {
        key: s,
        onClick: () => setSub(s),
        style: {
          textAlign: "left",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "10px 14px",
          marginLeft: -1,
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: active ? 700 : 500,
          color: active ? "var(--text-heading)" : "var(--text-muted)",
          borderLeft: `2px solid ${active ? "var(--action)" : "transparent"}`
        }
      }, s);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18
      }
    }, c.sections.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.label,
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: "none",
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(StatusIndicator, {
      tone: s.status,
      label: ""
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-heading)",
        fontSize: 16
      }
    }, s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: 13,
        marginTop: 2
      }
    }, s.note || `${s.done} of ${s.total} documents uploaded`)))))), /*#__PURE__*/React.createElement(Card, {
      title: "Audit files",
      actions: /*#__PURE__*/React.createElement(Button, {
        variant: "primary"
      }, "Generate audit file"),
      padded: false
    }, /*#__PURE__*/React.createElement(DataTable, {
      columns: auditCols,
      rows: c.audits,
      rowKey: "date"
    })))));
  }

  /* ---------------- PAYROLL ---------------- */
  function PayrollScreen() {
    const p = window.SesoData.payroll;
    const [sel, setSel] = React.useState(p.rows.map(r => r.id));
    const cols = [{
      key: "name",
      header: "Worker",
      sortable: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: "var(--text-heading)"
        }
      }, r.name), /*#__PURE__*/React.createElement("span", {
        className: "seso-mono",
        style: {
          color: "var(--text-muted)",
          fontSize: "var(--text-xs)"
        }
      }, r.id))
    }, {
      key: "method",
      header: "Pay method",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.method === "Paycard" ? "blue" : "neutral"
      }, r.method)
    }, {
      key: "hrs",
      header: "Hrs worked",
      mono: true,
      align: "right"
    }, {
      key: "ot",
      header: "OT hrs",
      mono: true,
      align: "right"
    }, {
      key: "gross",
      header: "Gross wages",
      mono: true,
      align: "right"
    }];
    const Stat = ({
      label,
      value,
      mono
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-muted)"
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      className: mono ? "seso-mono" : "",
      style: {
        fontSize: 20,
        fontWeight: 700,
        color: "var(--text-heading)"
      }
    }, value));
    return /*#__PURE__*/React.createElement("div", {
      style: PAGE
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 28,
        fontWeight: 800
      }
    }, p.crew), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      dot: true
    }, "Draft")), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 4,
        fontSize: 14
      }
    }, "Pay period ", p.period, " \xB7 ", p.schedule)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Download reports"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary"
    }, "Preview payroll"))), /*#__PURE__*/React.createElement(Card, {
      style: {
        marginTop: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 48,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Workers to be paid",
      value: p.workers,
      mono: true
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Gross wages",
      value: p.gross,
      mono: true
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Overtime wages",
      value: p.overtime,
      mono: true
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Approve by",
      value: p.approveBy
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Payday",
      value: p.payday
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        margin: "18px 0 14px"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(I.Plus, {
        size: 15
      })
    }, "Add time entries"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Apply compliance rules")), /*#__PURE__*/React.createElement(Card, {
      padded: false
    }, /*#__PURE__*/React.createElement(DataTable, {
      columns: cols,
      rows: p.rows,
      selectable: true,
      selected: sel,
      onSelect: setSel
    })));
  }
  Object.assign(window, {
    LoginScreen,
    WorkersScreen,
    WorkerProfileScreen,
    ContractScreen,
    PayrollScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/seso-app/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/seso-app/shell.jsx
try { (() => {
/* Seso UI kit — AppShell: sidebar + top bar layout. */
(function () {
  const {
    Sidebar,
    TopBar,
    Breadcrumb
  } = window.SesoDesignSystem_373f56;
  const I = window.SesoIcons;
  const NAV = [{
    id: "dashboard",
    label: "Dashboard",
    icon: React.createElement(I.LayoutDashboard)
  }, {
    id: "workers",
    label: "Workers",
    icon: React.createElement(I.Users)
  }, {
    id: "onboarding",
    label: "Onboarding",
    icon: React.createElement(I.FileText)
  }, {
    id: "contracts",
    label: "Contracts",
    icon: React.createElement(I.Briefcase)
  }, {
    id: "payroll",
    label: "Payroll",
    icon: React.createElement(I.DollarSign)
  }, {
    id: "paycards",
    label: "Paycards",
    icon: React.createElement(I.CreditCard)
  }];
  const FOOTER = [{
    id: "settings",
    label: "Settings",
    icon: React.createElement(I.Settings)
  }];
  function AppShell({
    nav,
    onNav,
    breadcrumb,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        height: "100%",
        width: "100%",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      logoSrc: "../../assets/logomark-white.png",
      company: window.SesoData.company,
      items: NAV,
      footerItems: FOOTER,
      active: nav,
      onSelect: onNav
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(TopBar, {
      left: /*#__PURE__*/React.createElement(Breadcrumb, {
        items: breadcrumb
      }),
      right: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("a", {
        href: "#",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600
        }
      }, /*#__PURE__*/React.createElement(I.AtSign, {
        size: 16
      }), " Contact"), /*#__PURE__*/React.createElement("a", {
        href: "#",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600
        }
      }, /*#__PURE__*/React.createElement(I.LogOut, {
        size: 16
      }), " Sign out"))
    }), /*#__PURE__*/React.createElement("main", {
      style: {
        flex: 1,
        overflow: "auto"
      }
    }, children)));
  }
  Object.assign(window, {
    AppShell,
    SESO_NAV: NAV
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/seso-app/shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.StatusIndicator = __ds_scope.StatusIndicator;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.FormField = __ds_scope.FormField;

__ds_ns.SidebarItem = __ds_scope.SidebarItem;

__ds_ns.StatField = __ds_scope.StatField;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
