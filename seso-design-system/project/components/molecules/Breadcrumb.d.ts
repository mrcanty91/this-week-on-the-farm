import React from "react";

export interface Crumb { label: string; href?: string; }

export interface BreadcrumbProps {
  /** Trail items; the last is rendered as the current page. */
  items: Array<string | Crumb>;
  style?: React.CSSProperties;
}

export function Breadcrumb(props: BreadcrumbProps): JSX.Element;
