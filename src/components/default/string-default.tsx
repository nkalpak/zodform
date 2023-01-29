import React from "react";
import { ErrorOrDescription } from "./error-or-description";

export interface IStringDefaultProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string;
}

export function StringDefault({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
}: IStringDefaultProps) {
  return (
    <label>
      {label}

      <input
        type="text"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      <ErrorOrDescription error={errorMessage} description={description} />
    </label>
  );
}
