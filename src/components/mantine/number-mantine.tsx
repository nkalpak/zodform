import { INumberDefaultProps } from "../default/number-default";
import { NumberInput } from "@mantine/core";

export function NumberMantine({
  name,
  value,
  onChange,
  description,
  errorMessage,
  label,
}: INumberDefaultProps) {
  return (
    <NumberInput
      name={name}
      value={value}
      onChange={(value) => onChange(value)}
      description={description}
      error={errorMessage}
      label={label}
    />
  );
}
