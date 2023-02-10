import React from 'react';
import { ErrorOrDescription } from './error-or-description';
import { IComponentProps } from '../types';
import { ComponentLabel } from '../component-label';

export interface IStringDefaultProps extends IComponentProps<string | undefined> {}

export function StringDefault({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage
}: IStringDefaultProps) {
  return (
    <ComponentLabel label={label}>
      <input type="text" name={name} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />

      <ErrorOrDescription error={errorMessage} description={description} />
    </ComponentLabel>
  );
}
