import { ZodFirstPartySchemaTypes, ZodObject } from 'zod';
import * as R from 'remeda';
import {
  isZodArray,
  isZodBoolean,
  isZodDate,
  isZodDefault,
  isZodEnum,
  isZodNumber,
  isZodObject,
  isZodOptional,
  isZodString
} from './schema-type-resolvers';

export function formDefaultValueFromSchema(schema: ZodObject<any>): Record<string, any> {
  return iterator(schema);

  function iterator(schema: ZodFirstPartySchemaTypes): any {
    if (isZodString(schema)) {
      return undefined;
    }
    if (isZodNumber(schema)) {
      return undefined;
    }
    if (isZodBoolean(schema)) {
      return false;
    }
    if (isZodEnum(schema)) {
      return undefined;
    }
    if (isZodOptional(schema)) {
      return undefined;
    }
    if (isZodDate(schema)) {
      return undefined;
    }
    if (isZodArray(schema)) {
      if (isZodEnum(schema._def.type)) {
        return [];
      }

      return R.range(0, schema._def.exactLength?.value ?? schema._def.minLength?.value ?? 0).map(() =>
        iterator(schema._def.type)
      );
    }
    if (isZodDefault(schema)) {
      return schema._def.defaultValue();
    }
    if (isZodObject(schema)) {
      const obj: Record<string, any> = {};
      for (const [key, value] of Object.entries(schema.shape)) {
        obj[key] = iterator(value as ZodFirstPartySchemaTypes);
        if (obj[key] === undefined) {
          delete obj[key];
        }
      }
      return obj;
    }
    throw new Error(`Unsupported schema type: ${schema}`);
  }
}
