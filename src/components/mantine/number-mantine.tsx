import { INumberDefaultProps } from "../default/number-default";
import { NumberInput } from "@mantine/core";

export function NumberMantine({
  name,
  value,
  onChange,
  description,
  errorMessage,
  label,
  isRequired,
  autoFocus,
  defaultValue,
}: INumberDefaultProps) {
  return (
    <NumberInput
      defaultValue={defaultValue}
      autoFocus={autoFocus}
      required={isRequired}
      name={name}
      value={value}
      onChange={(value) => onChange(value)}
      description={description}
      error={errorMessage}
      label={label}
    />
  );
}
