import * as zod from 'zod';
import { AnyZodObject, ZodString } from 'zod';
import { nn } from '../utils/invariant';

export const ZodTypeName = {
  ZodString: 'ZodString',
  ZodObject: 'ZodObject',
  ZodEnum: 'ZodEnum',
  ZodArray: 'ZodArray',
  ZodOptional: 'ZodOptional',
  ZodNumber: 'ZodNumber',
  ZodDefault: 'ZodDefault',
  ZodBoolean: 'ZodBoolean',
  ZodEffects: 'ZodEffects',
  ZodDate: 'ZodDate'
} as const;

function getZodTypeNameFromSchema(schema: unknown): string | undefined {
  // @ts-expect-error - private property
  return schema?._def?.typeName;
}

export function isZodString(schema: unknown): schema is ZodString {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodString;
}

export function isZodObject(schema: unknown): schema is AnyZodObject {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodObject;
}

export type ZodAnyEnum = zod.ZodEnum<[any]>;

export function isZodEnum(schema: unknown): schema is ZodAnyEnum {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodEnum;
}

export type ZodAnyArray = zod.ZodArray<any>;

export function isZodArray(schema: unknown): schema is ZodAnyArray {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodArray;
}

type ZodAnyOptional = zod.ZodOptional<any>;

export function isZodOptional(schema: unknown): schema is ZodAnyOptional {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodOptional;
}

export function isZodNumber(schema: unknown): schema is zod.ZodNumber {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodNumber;
}

export function isZodDefault(schema: unknown): schema is zod.ZodDefault<any> {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodDefault;
}

export function isZodBoolean(schema: unknown): schema is zod.ZodBoolean {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodBoolean;
}

export function isZodEffects(schema: unknown): schema is zod.ZodEffects<any> {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodEffects;
}

export function isZodDate(schema: unknown): schema is zod.ZodDate {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, 'Invalid schema');

  return typeName === ZodTypeName.ZodDate;
}
