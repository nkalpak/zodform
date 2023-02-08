import { Textarea, TextInput } from '@mantine/core';
import { IStringDefaultProps } from '@zodform/core';

export function StringMantine({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
  isRequired,
  isMultiline = false,

  ...props
}: IStringDefaultProps & {
  type?: 'text' | 'password';
  isMultiline?: boolean;
}) {
  const Component = isMultiline ? Textarea : TextInput;

  return (
    <Component
      {...props}
      required={isRequired}
      name={name}
      value={value ?? ''}
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

export function TextareaMantine(props: IStringDefaultProps) {
  return <StringMantine {...props} isMultiline />;
}
