import { INumberDefaultProps } from "../default/number-default";
import { NumberInput, Slider } from "@mantine/core";

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

export function SliderMantine({
  name,
  value,
  onChange,
  label,
  defaultValue,
  min,
  max,
}: INumberDefaultProps) {
  return (
    <Slider
      min={min}
      max={max}
      defaultValue={defaultValue}
      name={name}
      value={value}
      onChange={onChange}
      label={label}
    />
  );
}
