import { describe, test } from "vitest";
import { z } from "zod";
import { formDefaultValueFromSchema } from "./form-default-value-from-schema";

describe("formDefaultValueFromSchema", function () {
  describe("string", function () {
    test("should default to default value", function () {
      const schema = z.object({ name: z.string().default("John") });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({ name: "John" });
    });
  });

  describe("number", function () {
    test("should default to default value", function () {
      const schema = z.object({ age: z.number().default(18) });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({ age: 18 });
    });
  });

  describe("enum", function () {
    test("should default to default value", function () {
      const schema = z.object({
        color: z.enum(["red", "green", "blue"]).default("green"),
      });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({ color: "green" });
    });
  });

  describe("boolean", function () {
    test("should default to false", function () {
      const schema = z.object({ isHuman: z.boolean() });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({ isHuman: false });
    });

    test("should default to default value", function () {
      const schema = z.object({ isHuman: z.boolean().default(true) });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({ isHuman: true });
    });
  });

  describe("array", function () {
    test("should default to empty array", function () {
      const schema = z.object({ hobbies: z.array(z.string()) });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({ hobbies: [] });
    });

    test("should default to array of min length, with the element type", function () {
      const schema = z.object({ hobbies: z.array(z.string()).min(2) });
      const result = formDefaultValueFromSchema(schema);
      expect(result.hobbies).toHaveLength(2);
    });
  });

  describe("object", function () {
    test("should default to empty object", function () {
      const schema = z.object({ address: z.object({}) });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({ address: {} });
    });

    test("should default to object with default values", function () {
      const schema = z.object({
        address: z.object({
          street: z.string().default(""),
          city: z.string().default(""),
          country: z.string().default(""),
        }),
      });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({
        address: { street: "", city: "", country: "" },
      });
    });

    test("should default to object without any properties", function () {
      const schema = z.object({
        address: z.object({
          street: z.string(),
          city: z.string(),
          country: z.string(),
        }),
      });
      const result = formDefaultValueFromSchema(schema);
      expect(result).toEqual({
        address: {},
      });
    });
  });
});
