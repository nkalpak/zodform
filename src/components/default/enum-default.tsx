import React from "react";
import { ErrorOrDescription } from "./error-or-description";

interface IEnumDefaultProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
  description?: React.ReactNode;
  label: React.ReactNode;
  errorMessage?: string;
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
