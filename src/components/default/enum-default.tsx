import React from "react";
import { ErrorOrDescription } from "./error-or-description";
import { IComponentProps } from "../types";

interface IEnumDefaultProps extends IComponentProps<string> {
  options: string[];
}

export function EnumDefault({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
  options,
}: IEnumDefaultProps) {
  return (
    <label>
      {label}

      <select
        value={value}
        name={name}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ErrorOrDescription error={errorMessage} description={description} />
    </label>
  );
}
