import React from "react";

export interface IObjectDefaultProps {
  children: React.ReactNode[] | React.ReactNode;
  title?: React.ReactNode;
}

export function ObjectDefault({ children, title }: IObjectDefaultProps) {
  return (
    <div>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
}
