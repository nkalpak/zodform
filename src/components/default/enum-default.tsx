import React from "react";
import { ErrorOrDescription } from "./error-or-description";
import { IComponentProps } from "../types";
import { UiPropertiesEnum } from "../../core/form";

export interface IEnumDefaultProps
  extends IComponentProps<string | undefined>,
    UiPropertiesEnum<string> {
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
