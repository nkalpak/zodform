import * as R from 'remeda';
import { ZodAny, ZodDefault, ZodEffects, ZodOptional } from 'zod';
import { isZodEffects } from './schema-type-resolvers';

type ZodParentSchema = ZodOptional<any> | ZodDefault<any> | ZodEffects<any>;

/**
 * Zod schemas can be leaf schemas (e.g. z.string()) or parent schemas.
 * A schema becomes a parent schema in a situation like z.string().optional(),
 * where the parent schema is z.optional() and it contains a child schema z.string()
 *
 * So in the case of `z.string().optional().describe('Text')` for example, the description
 * ends up on the parent, not the child. Since rendering always tries to get to the leaf
 * schema, we need to merge the parent and child properties along the way.
 * */
export function mergeZodOuterInnerType(schema: ZodParentSchema): ZodAny {
  if (isZodEffects(schema)) {
    return mergeZodEffects(schema);
  }

  const childSchema = schema._def.innerType;

  const parentSchemaDef = R.omit(schema._def, ['innerType']);
  const resultDef = R.merge(parentSchemaDef, childSchema._def);

  return {
    ...childSchema,
    _def: resultDef
  };
}

function mergeZodEffects(schema: ZodEffects<any>) {
  const childSchema = schema._def.schema;

  const parentSchemaDef = R.omit(schema._def, ['schema']);
  const resultDef = R.merge(parentSchemaDef, childSchema._def);

  return {
    ...childSchema,
    _def: resultDef
  };
}
