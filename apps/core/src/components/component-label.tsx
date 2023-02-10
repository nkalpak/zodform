import React from 'react';

export function ComponentLabel({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      {label}

      {children}
    </label>
  );
}
