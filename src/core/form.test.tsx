import { describe, it, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { Form } from "./form";
import { z } from "zod";
import React from "react";

describe("Form", function () {
  describe("controlled value", function () {
    const schema = z.object({
      firstName: z.string().min(1, "Name must be at least 3 characters long"),
      lastName: z.string().min(1, "Name must be at least 3 characters long"),
      // Since HTML returns string for number inputs, we need to coerce the value
      age: z.coerce.number().min(1, "Age must be at least 1"),
      bio: z.string().optional(),
      password: z.string().describe("Needs to be strong"),
      phoneNumber: z.string(),

      people: z.array(z.string()).min(1, "Must have at least one person"),
      details: z.object({
        address: z.string(),
      }),
    });

    const value = {
      firstName: "John",
      bio: "Hello",
      age: 34,
      lastName: "Doe",
      password: "123456",
      people: ["Thomas", "Jane"],
      phoneNumber: "1234567890",
      details: {
        address: "123 Main St",
      },
    };

    test("all values show up", async function () {
      const screen = render(<Form schema={schema} value={value} />);

      expect(await screen.getByDisplayValue(value.firstName)).toBeTruthy();
      expect(await screen.getByDisplayValue(value.lastName)).toBeTruthy();
      expect(await screen.getByDisplayValue(value.age)).toBeTruthy();
      expect(await screen.getByDisplayValue(value.bio)).toBeTruthy();
      expect(await screen.getByDisplayValue(value.password)).toBeTruthy();
      expect(await screen.getByDisplayValue(value.phoneNumber)).toBeTruthy();
      expect(
        await screen.getByDisplayValue(value.details.address)
      ).toBeTruthy();
      expect(await screen.getByDisplayValue(value.people[0]!)).toBeTruthy();
      expect(await screen.getByDisplayValue(value.people[1]!)).toBeTruthy();
    });
  });
});
