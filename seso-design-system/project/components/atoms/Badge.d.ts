import React from "react";

export type BadgeTone = "neutral" | "green" | "blue" | "amber" | "red";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. `green` is the H-2A / on-contract badge. @default "neutral" */
  tone?: BadgeTone;
  /** Solid fill instead of soft tint. @default false */
  solid?: boolean;
  /** Show a leading status dot. @default false */
  dot?: boolean;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
