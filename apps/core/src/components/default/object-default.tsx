import React from 'react';
import { UiPropertiesCompound } from '../../core/form';

export interface IObjectDefaultProps extends UiPropertiesCompound<any> {
  children: React.ReactNode[] | React.ReactNode;
}

export function ObjectDefault({ children, title, description }: IObjectDefaultProps) {
  return (
    <div>
      {title && <h2>{title}</h2>}
      {children}

      {description && <p>{description}</p>}
    </div>
  );
}
