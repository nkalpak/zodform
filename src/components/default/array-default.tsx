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
        <div onClick={() => onRemove(index)} key={index}>
          {child}
          <button>-</button>
        </div>
      ))}

      <button onClick={onAdd}>+</button>
    </div>
  );
}
