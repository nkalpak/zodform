import { IComponentProps } from '../types';
import { ErrorOrDescription } from './error-or-description';

export interface IBooleanDefaultProps extends IComponentProps<boolean> {}

export function BooleanDefault({
  defaultValue,
  value,
  onChange,
  label,
  description,
  errorMessage,
  name,
  autoFocus
}: IBooleanDefaultProps) {
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
