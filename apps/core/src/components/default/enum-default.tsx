import React from 'react';
import { ErrorOrDescription } from './error-or-description';
import { IComponentProps } from '../types';
import { ComponentLabel } from '../component-label';

export interface IEnumDefaultProps extends IComponentProps<string | undefined> {
  options: string[];
  optionLabels?: Record<string, string>;
}

export function EnumDefault({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
  options,
  optionLabels
}: IEnumDefaultProps) {
  return (
    <ComponentLabel label={label}>
      <select value={value} name={name} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>

        {options.map((option) => {
          const label = optionLabels?.[option] ?? option;
          return (
            <option key={option} value={option}>
              {label}
            </option>
          );
        })}
      </select>

      <ErrorOrDescription error={errorMessage} description={description} />
    </ComponentLabel>
  );
}
