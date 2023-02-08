// Asserts that the condition is true, otherwise throws an error with the given message
export function invariant(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// Special-case assertion, used to assert that `value` is defined
export function nn(value: unknown, message?: string): asserts value {
  invariant(value !== null && value !== undefined, message);
}
