import React from "react";

export interface SelectOption { value: string; label: string; }

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Options as strings or {value,label}. Ignored if children are passed. */
  options?: Array<string | SelectOption>;
  invalid?: boolean;
  children?: React.ReactNode;
}

export function Select(props: SelectProps): JSX.Element;
