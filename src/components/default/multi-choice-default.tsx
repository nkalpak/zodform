export interface IMultiChoiceDefaultProps<Value extends string = string> {
  options: Value[];
  value: Value[];
  onAdd: (value: Value) => void;
  onRemove: (value: Value) => void;
}

export function MultiChoiceDefault({
  options,
  value,
  onRemove,
  onAdd,
}: IMultiChoiceDefaultProps) {
  return (
    <div>
      {options.map((option) => (
        <label style={{ display: "flex", flexDirection: "row" }}>
          <input
            onChange={() => {
              if (value.includes(option)) {
                onRemove(option);
              } else {
                onAdd(option);
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
