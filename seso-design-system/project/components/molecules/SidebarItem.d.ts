import React from "react";

export interface SidebarItemProps {
  /** 20×20 icon node (Lucide recommended). */
  icon?: React.ReactNode;
  label: React.ReactNode;
  active?: boolean;
  /** Icon-only collapsed rail. @default false */
  collapsed?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function SidebarItem(props: SidebarItemProps): JSX.Element;
