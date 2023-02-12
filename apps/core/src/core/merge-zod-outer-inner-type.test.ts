import { describe, test, expect } from 'vitest';
import { mergeZodOuterInnerType } from './merge-zod-outer-inner-type';
import { z } from 'zod';
import { ZodTypeName } from './schema-type-resolvers';

describe('mergeParentChildZodProperties', () => {
  test('should merge parent and child properties', () => {
    const result = mergeZodOuterInnerType(z.string().optional().describe('Text'));

    expect(result._def.description).toBe('Text');
    expect(result._def.typeName).toBe(ZodTypeName.ZodString);
  });
});
