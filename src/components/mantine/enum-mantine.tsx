import { IEnumDefaultProps } from "../default/enum-default";
import { Select } from "@mantine/core";

export function EnumMantine({
  value,
  onChange,
  label,
  description,
  errorMessage,
  name,
  options,
  isRequired,
  defaultValue,
  autoFocus,
}: IEnumDefaultProps) {
  return (
    <Select
      autoFocus={autoFocus}
      defaultValue={defaultValue}
      required={isRequired}
      value={value}
      onChange={(value) => onChange(value ?? undefined)}
      label={label}
      description={description}
      name={name}
      error={errorMessage}
      data={options.map((option) => ({
        value: option,
        label: option,
      }))}
    />
  );
}
