import { componentNameDeserialize } from './component-name-deserialize';
import { nn } from '../utils/invariant';

export function parseArrayIndicesFromName<Select extends string | undefined>(
  name: string,
  select?: Select
): undefined extends Select ? Record<string, number> : number {
  const indices: Record<string, number> = {};
  const parts = componentNameDeserialize(name);

  for (let i = 1; i < parts.length; i++) {
    const prev = parts[i - 1]!;
    const curr = parts[i]!;

    if (typeof curr === 'number') {
      indices[prev] = curr;
    }
  }

  if (select != null) {
    const result = indices[select];
    nn(result, `No index found for ${select} in ${name}`);
    // @ts-expect-error - we know that result is a number
    return result;
  }

  // @ts-expect-error - we know that indices is a Record<string, number>
  return indices;
}
