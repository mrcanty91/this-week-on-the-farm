import React from "react";

export interface TopBarProps {
  /** Left cluster — usually a Breadcrumb. */
  left?: React.ReactNode;
  /** Right cluster — account links / actions. */
  right?: React.ReactNode;
  style?: React.CSSProperties;
}

export function TopBar(props: TopBarProps): JSX.Element;
