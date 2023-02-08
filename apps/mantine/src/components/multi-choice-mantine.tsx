import { IMultiChoiceDefaultProps } from '@zodform/core';
import { Checkbox } from '@mantine/core';
import React from 'react';

export function MultiChoiceMantine({
  onChange,
  options,
  value,
  optionLabels,
  label,
  errorMessage
}: IMultiChoiceDefaultProps) {
  return (
    <Checkbox.Group error={errorMessage} label={label} value={value} onChange={onChange}>
      {options.map((option) => {
        const label = optionLabels?.[option] ?? option;
        return <Checkbox key={option} value={option} label={label} />;
      })}
    </Checkbox.Group>
  );
}
