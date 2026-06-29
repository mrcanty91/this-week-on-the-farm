import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Red border for validation errors. @default false */
  invalid?: boolean;
  /** Leading adornment (icon / text). */
  prefix?: React.ReactNode;
  /** Trailing adornment (icon / unit). */
  suffix?: React.ReactNode;
}

export function Input(props: InputProps): JSX.Element;
