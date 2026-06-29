import React from "react";

export type StatusTone = "success" | "warning" | "pending" | "info" | "danger";

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Maps to a default glyph + color. @default "success" */
  tone?: StatusTone;
  /** Text label after the glyph. */
  label?: React.ReactNode;
  /** Override the default glyph. */
  icon?: React.ReactNode;
}

export function StatusIndicator(props: StatusIndicatorProps): JSX.Element;
