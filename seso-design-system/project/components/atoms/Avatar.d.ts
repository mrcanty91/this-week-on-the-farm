import React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL; falls back to initials from `name`. */
  src?: string;
  /** Full name — used for initials + alt text. */
  name?: string;
  /** Pixel size (square). @default 40 */
  size?: number;
  /** `circle` (users) · `rounded` (worker photos) · `square`. @default "circle" */
  shape?: "circle" | "rounded" | "square";
}

export function Avatar(props: AvatarProps): JSX.Element;
