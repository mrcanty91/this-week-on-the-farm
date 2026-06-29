import React from "react";

export interface StatFieldProps {
  /** Small muted caption above the value. */
  label: React.ReactNode;
  /** Value content (text, Badge, StatusIndicator…). */
  children: React.ReactNode;
  /** Render the value in the mono/tabular face (IDs, numbers). @default false */
  mono?: boolean;
  style?: React.CSSProperties;
}

export function StatField(props: StatFieldProps): JSX.Element;
