import * as zod from "zod";
import { AnyZodObject, ZodString } from "zod";
import { nn } from "../utils/invariant";

function getZodTypeNameFromSchema(schema: unknown): string | undefined {
  // @ts-expect-error
  return schema?._def?.typeName;
}

export function isZodString(schema: unknown): schema is ZodString {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodString";
}

export function isZodObject(schema: unknown): schema is AnyZodObject {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodObject";
}

export type ZodAnyEnum = zod.ZodEnum<[any]>;

export function isZodEnum(schema: unknown): schema is ZodAnyEnum {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodEnum";
}

export type ZodAnyArray = zod.ZodArray<any>;

export function isZodArray(schema: unknown): schema is ZodAnyArray {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodArray";
}

type ZodAnyOptional = zod.ZodOptional<any>;

export function isZodOptional(schema: unknown): schema is ZodAnyOptional {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodOptional";
}

export function isZodNumber(schema: unknown): schema is zod.ZodNumber {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodNumber";
}

export function isZodDefault(schema: unknown): schema is zod.ZodDefault<any> {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodDefault";
}

export function isZodBoolean(schema: unknown): schema is zod.ZodBoolean {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodBoolean";
}

export function isZodEffects(schema: unknown): schema is zod.ZodEffects<any> {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodEffects";
}
