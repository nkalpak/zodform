import { IComponentProps } from '../types';
import React from 'react';
import { ErrorOrDescription } from './error-or-description';

function formatDateValue(date: Date) {
  return date.toISOString().split('T')[0];
}

export interface IDateDefaultProps extends IComponentProps<Date> {}

export function DateDefault({
  value,
  onChange,
  label,
  description,
  errorMessage,
  name,
  autoFocus
}: IDateDefaultProps) {
  return (
    <div>
      <label>
        {label}
        <input
          type="date"
          name={name}
          value={value ? formatDateValue(value) : ''}
          onChange={(event) => {
            try {
              onChange(new Date(event.target.value));
            } catch (error) {}
          }}
          autoFocus={autoFocus}
        />
      </label>

      <ErrorOrDescription error={errorMessage} description={description} />
    </div>
  );
}
