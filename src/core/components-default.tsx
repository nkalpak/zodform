import React from "react";

export interface IStringDefaultProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string;
}

export function StringDefault({
  name,
  value,
  onChange,
  label,
  description,
  errorMessage,
}: IStringDefaultProps) {
  function renderBelow() {
    if (errorMessage) {
      return <span style={{ color: "red" }}>{errorMessage}</span>;
    }

    if (description) {
      return <span style={{ color: "#333" }}>{description}</span>;
    }
  }

  return (
    <label>
      {label}

      <input
        type="text"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      {renderBelow()}
    </label>
  );
}
