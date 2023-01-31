import { IMultiChoiceDefaultProps } from "../default/multi-choice-default";
import { Checkbox } from "@mantine/core";
import React from "react";

export function MultiChoiceMantine({
  onChange,
  options,
  value,
  optionLabels,
  title,
}: IMultiChoiceDefaultProps) {
  return (
    <Checkbox.Group label={title} value={value} onChange={onChange}>
      {options.map((option) => {
        const label = optionLabels?.[option] ?? option;
        return <Checkbox key={option} value={option} label={label} />;
      })}
    </Checkbox.Group>
  );
}
