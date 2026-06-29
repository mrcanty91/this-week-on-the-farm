import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional header title. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Header action cluster (buttons). */
  actions?: React.ReactNode;
  /** Apply default body padding. @default true */
  padded?: boolean;
  bodyStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Card(props: CardProps): JSX.Element;
