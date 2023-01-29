import React from "react";

export interface IComponentProps<Value> {
  value?: Value;
  defaultValue?: Value;
  onChange: (value: Value) => void;
  name: string;
  description?: React.ReactNode;
  label: React.ReactNode;
  errorMessage?: string;
  isRequired?: boolean;
  autoFocus?: boolean;
}
