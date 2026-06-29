import React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  /** Renders the mixed (—) state — for "select all" headers. @default false */
  indeterminate?: boolean;
  /** Optional inline label. */
  label?: React.ReactNode;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
