import React from "react";

export interface IArrayDefaultProps {
  children: React.ReactNode[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  title?: React.ReactNode;
}

export function ArrayDefault({
  children,
  onAdd,
  onRemove,
  title,
}: IArrayDefaultProps) {
  return (
    <React.Fragment>
      {title}

      {children.map((child, index) => (
        <div key={index}>
          {child}
          <button onClick={() => onRemove(index)}>-</button>
        </div>
      ))}

      <button onClick={onAdd}>+</button>
    </React.Fragment>
  );
}
