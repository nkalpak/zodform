import React from "react";

export function ArrayDefault({
  children,
  onAdd,
  onRemove,
}: {
  children: React.ReactNode[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      {children.map((child, index) => (
        <div key={index}>
          {child}
          <button onClick={() => onRemove(index)}>-</button>
        </div>
      ))}

      <button onClick={onAdd}>+</button>
    </div>
  );
}
