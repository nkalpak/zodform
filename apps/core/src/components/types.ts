import React from 'react';

export interface IComponentProps<Value> {
  value?: Value;
  defaultValue?: Value;
  onChange: (value: Value) => void;
  name: string;
  errorMessage?: string;
  isRequired?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  autoFocus?: boolean;
}
