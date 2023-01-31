import { UiPropertiesMultiChoice } from "../../core/form";

export interface IMultiChoiceDefaultProps<Value extends string = string>
  extends UiPropertiesMultiChoice<Value> {
  options: Value[];
  value: Value[];
  onChange: (value: Value[]) => void;
}

export function MultiChoiceDefault({
  options,
  value,
  onChange,
}: IMultiChoiceDefaultProps) {
  return (
    <div>
      {options.map((option) => (
        <label style={{ display: "flex", flexDirection: "row" }}>
          <input
            onChange={() => {
              if (value.includes(option)) {
                onChange(value.filter((v) => v !== option));
              } else {
                onChange([...value, option]);
              }
            }}
            type="checkbox"
            checked={value.includes(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
