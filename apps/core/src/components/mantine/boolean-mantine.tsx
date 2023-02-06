import { IBooleanDefaultProps } from "../default/boolean-default";
import { Checkbox } from "@mantine/core";

export function BooleanMantine({
  value,
  defaultValue,
  onChange,
  label,
  description,
  errorMessage,
  name,
  isRequired,
  autoFocus,
}: IBooleanDefaultProps) {
  return (
    <Checkbox
      name={name}
      checked={value}
      defaultChecked={defaultValue}
      onChange={(event) => onChange(event.currentTarget.checked)}
      label={label}
      description={description}
      error={errorMessage}
      required={isRequired}
      autoFocus={autoFocus}
    />
  );
}
