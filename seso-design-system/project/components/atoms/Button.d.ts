import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "brand" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style. `primary` is the action-blue fill used for the main action
   * in a view (Save, Preview payroll). `secondary` is the white/hairline
   * button used for row actions. `ghost` is text-only. `brand` is the green
   * fill (reserve for brand/marketing CTAs). `danger` is destructive.
   * @default "primary"
   * @startingPoint section="Atoms" subtitle="Primary, secondary, ghost & brand buttons" viewport="700x220"
   */
  variant?: ButtonVariant;
  /** @default "md" */
  size?: ButtonSize;
  /** Icon node rendered before the label (size with 1em). */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to fill the container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
