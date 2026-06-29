import React from "react";

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  /** White logomark image src (relative to the consuming page). */
  logoSrc?: string;
  /** Brand wordmark text. @default "Seso" */
  brand?: string;
  /** Org/account subtitle under the brand (e.g. "Acme Fruits, Inc."). */
  company?: string;
  items: NavItem[];
  /** Items pinned to the bottom (settings, profile…). */
  footerItems?: NavItem[];
  /** Active item id. */
  active?: string;
  onSelect?: (id: string) => void;
  width?: number | string;
  style?: React.CSSProperties;
  /**
   * @startingPoint section="Organisms" subtitle="Dark app navigation rail" viewport="280x640"
   */
}

export function Sidebar(props: SidebarProps): JSX.Element;
