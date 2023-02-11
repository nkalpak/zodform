import { describe, test, expect } from 'vitest';
import { mergeParentChildZodProperties } from './merge-parent-child-zod-properties';
import { z } from 'zod';
import { ZodTypeName } from './schema-type-resolvers';

describe('mergeParentChildZodProperties', () => {
  test('should merge parent and child properties', () => {
    const result = mergeParentChildZodProperties(z.string().optional().describe('Text'));

    expect(result._def.description).toBe('Text');
    expect(result._def.typeName).toBe(ZodTypeName.ZodString);
  });
});
