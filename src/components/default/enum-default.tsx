import React from "react";
import { ErrorOrDescription } from "./error-or-description";
import { IComponentProps } from "../types";

export interface IEnumDefaultProps extends IComponentProps<string | undefined> {
  options: string[];
  optionLabels?: Record<string, React.ReactNode>;
}

export function EnumDefault({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
  options,
  optionLabels,
}: IEnumDefaultProps) {
  return (
    <label>
      {label}

      <select
        value={value}
        name={name}
        onChange={(event) => onChange(event.target.value)}
      >
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
    </label>
  );
}
