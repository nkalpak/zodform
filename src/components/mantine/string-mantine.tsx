import { TextInput } from "@mantine/core";
import { IStringDefaultProps } from "../default/string-default";

export function StringMantine({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
  isRequired,

  ...props
}: IStringDefaultProps & {
  type?: "text" | "password";
}) {
  return (
    <TextInput
      {...props}
      required={isRequired}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={label}
      description={description}
      error={errorMessage}
    />
  );
}

export function PasswordMantine(props: IStringDefaultProps) {
  return <StringMantine {...props} type="password" />;
}
