import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** @default "neutral" */
  color?: "neutral" | "green" | "blue";
  /** Provide to render a dismiss (×) button — makes it a filter chip. */
  onRemove?: () => void;
}

export function Tag(props: TagProps): JSX.Element;
