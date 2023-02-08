import React from 'react';

export function ErrorOrDescription({
  description,
  error
}: {
  error?: string;
  description?: React.ReactNode;
}) {
  if (error) {
    return <span style={{ color: 'red' }}>{error}</span>;
  }

  if (description) {
    return <span style={{ color: '#333' }}>{description}</span>;
  }

  return null;
}
