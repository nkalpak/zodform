import { UiPropertiesMultiChoice } from "../../core/form";
import React from "react";

export interface IMultiChoiceDefaultProps<Value extends string = string>
  extends Omit<UiPropertiesMultiChoice<Value>, "title"> {
  options: Value[];
  value: Value[];
  onChange: (value: Value[]) => void;
  errorMessage?: string;
  label?: React.ReactNode;
}

export function MultiChoiceDefault({
  options,
  value,
  onChange,
}: IMultiChoiceDefaultProps) {
  return (
    <div>
      {options.map((option) => (
        <label style={{ display: "flex", flexDirection: "row" }}>
          <input
            onChange={() => {
              if (value.includes(option)) {
                onChange(value.filter((v) => v !== option));
              } else {
                onChange([...value, option]);
              }
            }}
            type="checkbox"
            checked={value.includes(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
