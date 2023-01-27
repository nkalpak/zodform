import { describe, it, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { Form } from "./form";
import { z } from "zod";
import React from "react";

describe("Form", function () {
  describe("controlled value", function () {
    test("all values show up", async function () {
      const schema = z.object({
        firstName: z.string().min(1, "Name must be at least 3 characters long"),
        lastName: z.string().min(1, "Name must be at least 3 characters long"),
        // Since HTML returns string for number inputs, we need to coerce the value
        age: z.coerce.number().min(1, "Age must be at least 1"),
        bio: z.string().optional(),
        password: z.string().describe("Needs to be strong"),
        phoneNumber: z.string(),

        people: z.array(z.string()).min(1, "Must have at least one person"),
      });

      const value = {
        firstName: "John",
        bio: "Hello",
        age: 34,
        lastName: "Doe",
        password: "123456",
        people: ["Thomas", "Jane"],
        phoneNumber: "1234567890",
      };

      const screen = render(<Form schema={schema} value={value} />);

      for (const inputValue of Object.values(value)) {
        const valueAsArray = Array.isArray(inputValue)
          ? inputValue
          : [inputValue];
        for (const value of valueAsArray) {
          const a = await screen.getByDisplayValue(value);
          expect(a).toBeDefined();
        }
      }
    });
  });
});
