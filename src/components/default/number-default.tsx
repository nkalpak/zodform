import { IComponentProps } from "../types";
import React from "react";
import { ErrorOrDescription } from "./error-or-description";

export interface INumberDefaultProps
  extends IComponentProps<number | undefined> {}

export function NumberDefault({
  value,
  onChange,
  label,
  description,
  errorMessage,
  name,
}: INumberDefaultProps) {
  return (
    <label>
      {label}

      <input
        type="number"
        name={name}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.valueAsNumber)}
      />

      <ErrorOrDescription error={errorMessage} description={description} />
    </label>
  );
}
