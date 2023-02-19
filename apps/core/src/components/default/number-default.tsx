import { IComponentProps } from '../types';
import React from 'react';
import { ErrorOrDescription } from './error-or-description';
import { ComponentLabel } from '../component-label';

export interface INumberDefaultProps extends IComponentProps<number | undefined> {
  min?: number;
  max?: number;
}

export function NumberDefault({
  value,
  onChange,
  label,
  description,
  errorMessage,
  name
}: INumberDefaultProps) {
  return (
    <ComponentLabel label={label}>
      <input
        type="number"
        name={name}
        value={value ?? ''}
        onChange={(event) =>
          onChange(Number.isNaN(event.target.valueAsNumber) ? undefined : event.target.valueAsNumber)
        }
      />

      <ErrorOrDescription error={errorMessage} description={description} />
    </ComponentLabel>
  );
}
