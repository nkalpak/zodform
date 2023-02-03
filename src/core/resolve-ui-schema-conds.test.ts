import { describe, test } from "vitest";
import { z } from "zod";
import { UiSchema } from "./form";
import { resolveUiSchemaConds } from "./resolve-ui-schema-conds";

describe("resolveUiSchemaConds", function () {
  test("resolves nested properties", function () {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      address: z.object({
        street: z.string(),
        fruits: z.array(z.enum(["apple", "banana"] as const)),
        city: z.object({
          name: z.string(),
        }),
        people: z.array(
          z.object({
            name: z.string(),
            age: z.number(),
          })
        ),
      }),
    });
    const uiSchema: UiSchema<typeof schema> = {
      name: {
        cond: (formData) => (formData.age ? formData.age > 18 : false),
      },
      address: {
        ui: {
          cond: (formData) => (formData.age ? formData.age > 18 : false),
        },
        street: {
          cond: (formData) => (formData.age ? formData.age > 18 : false),
        },
        fruits: {
          cond: (formData) => (formData.age ? formData.age < 18 : false),
        },
        city: {
          name: {
            cond: (formData) => (formData.age ? formData.age < 18 : false),
          },
        },
        people: {
          element: {
            age: {
              cond: (formData) => (formData.age ? formData.age < 18 : false),
            },
          },
        },
      },
    };

    const result = resolveUiSchemaConds({ uiSchema, formData: { age: 10 } });

    expect(result).toEqual(
      expect.arrayContaining([
        {
          path: ["name"],
          cond: false,
        },
        {
          cond: false,
          path: ["address", "street"],
        },
        {
          cond: true,
          path: ["address", "fruits"],
        },
        {
          cond: false,
          path: ["address"],
        },
        {
          cond: true,
          path: ["address", "city", "name"],
        },
        {
          cond: true,
          path: ["address", "people", "age"],
        },
      ])
    );
  });
});
