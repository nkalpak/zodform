import { describe, test, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { ExtractSchemaFromEffects } from './extract-schema-from-effects';

describe('ExtractSchemaFromEffects', function () {
  test('works', function () {
    const schema = z.object({
      people: z
        .array(
          z.object({
            age: z.number()
          })
        )
        .min(1)
    });
    const schemaWithEffects = schema
      .refine(() => true)
      .refine(() => true)
      .refine(() => true);

    type SchemaWithEffects = typeof schemaWithEffects;

    expectTypeOf<ExtractSchemaFromEffects<SchemaWithEffects>>().toMatchTypeOf<typeof schema>();
  });
});
