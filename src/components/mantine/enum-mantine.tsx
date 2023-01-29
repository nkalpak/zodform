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
}: IEnumDefaultProps) {
  return (
    <Select
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
