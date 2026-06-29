import React from "react";

export interface FormFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  /** Muted helper text below the control. */
  helper?: React.ReactNode;
  /** Error message — overrides helper and shows in red. */
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function FormField(props: FormFieldProps): JSX.Element;
