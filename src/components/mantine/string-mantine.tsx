import { TextInput } from "@mantine/core";
import { IStringDefaultProps } from "../default/string-default";

export function StringMantine({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
}: IStringDefaultProps) {
  return (
    <TextInput
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={label}
      description={description}
      error={errorMessage}
    />
  );
}
