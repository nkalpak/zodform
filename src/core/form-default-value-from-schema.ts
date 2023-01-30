import { ZodFirstPartySchemaTypes, ZodObject } from "zod";
import * as R from "remeda";
import {
  isZodArray,
  isZodBoolean,
  isZodDefault,
  isZodEnum,
  isZodNumber,
  isZodObject,
  isZodOptional,
  isZodString,
} from "./schema-type-resolvers";

export function formDefaultValueFromSchema(
  schema: ZodObject<any>
): Record<string, any> {
  return iterator(schema);

  function iterator(schema: ZodFirstPartySchemaTypes): any {
    if (isZodString(schema)) {
      return "";
    }
    if (isZodNumber(schema)) {
      return 0;
    }
    if (isZodBoolean(schema)) {
      return false;
    }
    if (isZodEnum(schema)) {
      return schema.options[0];
    }
    if (isZodArray(schema)) {
      return R.range(
        0,
        schema._def.exactLength?.value ?? schema._def.minLength?.value ?? 0
      ).map(() => iterator(schema._def.type));
    }
    if (isZodOptional(schema)) {
      return undefined;
    }
    if (isZodDefault(schema)) {
      return schema._def.defaultValue();
    }
    if (isZodObject(schema)) {
      const obj: Record<string, any> = {};
      for (const [key, value] of Object.entries(schema.shape)) {
        obj[key] = iterator(value);
        if (obj[key] === undefined) {
          delete obj[key];
        }
      }
      return obj;
    }
    throw new Error(`Unsupported schema type: ${schema}`);
  }
}