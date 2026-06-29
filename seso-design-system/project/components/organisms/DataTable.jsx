import React from "react";
import { Checkbox } from "../atoms/Checkbox.jsx";

/**
 * Seso DataTable — the workhorse list view (workers, payroll, audit files).
 * Light header, hairline row separators, optional row selection.
 * Columns declare how each cell renders; pass `render(row)` for rich cells.
 */
export function DataTable({
  columns = [],
  rows = [],
  selectable = false,
  selected = [],
  onSelect,
  rowKey = "id",
  onRowClick,
  style,
}) {
  const allChecked = selectable && rows.length > 0 && selected.length === rows.length;
  const someChecked = selectable && selected.length > 0 && !allChecked;

  const toggleAll = () => {
    if (!onSelect) return;
    onSelect(allChecked ? [] : rows.map((r) => r[rowKey]));
  };
  const toggleRow = (id) => {
    if (!onSelect) return;
    onSelect(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
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
    borderBottom: "1px solid var(--border)",
  };

  return (
    <div style={{ width: "100%", overflowX: "auto", ...style }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr>
            {selectable ? (
              <th style={{ ...th, width: 44 }}>
                <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
              </th>
            ) : null}
            {columns.map((c) => (
              <th key={c.key} style={{ ...th, textAlign: c.align || "left", width: c.width }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {c.header}
                  {c.sortable ? (
                    <svg viewBox="0 0 16 16" width="12" height="12" style={{ color: "var(--gray-400)" }} aria-hidden="true">
                      <path d="M8 3v10M8 3L5.5 5.5M8 3l2.5 2.5M8 13l-2.5-2.5M8 13l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = row[rowKey];
            return (
              <tr
                key={id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? "pointer" : "default", borderBottom: "1px solid var(--border-hairline)" }}
              >
                {selectable ? (
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.includes(id)} onChange={() => toggleRow(id)} />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "12px 16px",
                      verticalAlign: "middle",
                      textAlign: c.align || "left",
                      fontSize: "var(--text-sm)",
                      color: "var(--text-body)",
                      fontFamily: c.mono ? "var(--font-mono)" : "var(--font-sans)",
                      fontFeatureSettings: c.mono ? '"tnum"' : undefined,
                      whiteSpace: c.wrap ? "normal" : "nowrap",
                    }}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
