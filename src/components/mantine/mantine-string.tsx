import { IStringDefaultProps } from "../../core/components-default";
import { TextInput } from "@mantine/core";

export function MantineString({
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
