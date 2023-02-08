import React from 'react';
import * as R from 'remeda';

export function useUncontrolledToControlledWarning(value: unknown) {
  const [firstValue] = React.useState(value);

  if (R.isNil(firstValue) && R.isDefined(value)) {
    console.warn('Component changed from controlled to uncontrolled');
  }
}
