import React from "react";

export interface Column<Row = any> {
  /** Unique column key (also the row property read when no `render`). */
  key: string;
  header: React.ReactNode;
  /** Custom cell renderer. */
  render?: (row: Row) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: number | string;
  /** Show a sort affordance in the header. */
  sortable?: boolean;
  /** Render cell in mono/tabular face (IDs, currency). */
  mono?: boolean;
  /** Allow wrapping (default cells are nowrap). */
  wrap?: boolean;
}

export interface DataTableProps<Row = any> {
  columns: Column<Row>[];
  rows: Row[];
  /** Show the leading selection checkbox column. */
  selectable?: boolean;
  /** Selected row keys (controlled). */
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  /** Property used as the row key. @default "id" */
  rowKey?: string;
  onRowClick?: (row: Row) => void;
  style?: React.CSSProperties;
  /**
   * @startingPoint section="Organisms" subtitle="Sortable, selectable list view" viewport="900x420"
   */
}

export function DataTable<Row = any>(props: DataTableProps<Row>): JSX.Element;
