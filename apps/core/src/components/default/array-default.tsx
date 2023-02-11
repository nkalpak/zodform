import React from 'react';
import { UiPropertiesCompound } from '../../core/form';

export interface IArrayDefaultProps extends UiPropertiesCompound<any, any> {
  children: React.ReactNode[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ArrayDefault({ children, onAdd, onRemove, title, description }: IArrayDefaultProps) {
  return (
    <React.Fragment>
      {title}

      {children.map((child, index) => (
        <div key={index}>
          {child}
          <button type="button" onClick={() => onRemove(index)}>
            -
          </button>
        </div>
      ))}

      <button type="button" onClick={onAdd}>
        +
      </button>

      {description}
    </React.Fragment>
  );
}
