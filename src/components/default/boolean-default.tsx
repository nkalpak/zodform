import { IComponentProps } from "../types";
import { ErrorOrDescription } from "./error-or-description";

export function BooleanDefault({
  defaultValue,
  value,
  onChange,
  label,
  description,
  errorMessage,
  name,
  autoFocus,
}: IComponentProps<boolean>) {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          name={name}
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          autoFocus={autoFocus}
          defaultChecked={defaultValue}
        />
        {label}
      </label>

      <ErrorOrDescription error={errorMessage} description={description} />
    </div>
  );
}
