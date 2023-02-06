import { IEnumDefaultProps } from "../default/enum-default";
import { Radio, Select } from "@mantine/core";

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

export function EnumMantineRadio({
  value,
  isRequired,
  defaultValue,
  description,
  errorMessage,
  name,
  options,
  label,
  onChange,
  optionLabels,
}: IEnumDefaultProps) {
  return (
    <Radio.Group
      value={value}
      required={isRequired}
      name={name}
      defaultValue={defaultValue}
      description={description}
      error={errorMessage}
      label={label}
      onChange={onChange}
    >
      {options.map((option) => {
        const label = optionLabels?.[option];
        return <Radio key={option} value={option} label={label ?? option} />;
      })}
    </Radio.Group>
  );
}
