import React from "react";
import { Form } from "./form";
import { z } from "zod";
import {
  PasswordMantine,
  StringMantine,
} from "../components/mantine/string-mantine";
import { EnumMantine } from "../components/mantine/enum-mantine";
import { NumberMantine } from "../components/mantine/number-mantine";
import { BooleanMantine } from "../components/mantine/boolean-mantine";

const leafs = {
  string: StringMantine,
  enum: EnumMantine,
  number: NumberMantine,
  boolean: BooleanMantine,
} as const;

export function Simple() {
  const [schema] = React.useState(() =>
    z.object({
      details: z.object({
        address: z.string(),
      }),
      firstName: z.string().min(1, "Name must be at least 3 characters long"),
      lastName: z.string().min(1, "Name must be at least 3 characters long"),
      // Since HTML returns string for number inputs, we need to coerce the value
      age: z.coerce.number().min(1, "Age must be at least 1"),
      bio: z.string().optional(),
      password: z.string().describe("Needs to be strong"),
      phoneNumber: z.string(),

      people: z.array(z.string()).min(1, "Must have at least one person"),
      fruits: z.enum(["apple", "banana", "orange"] as const).default("banana"),
    })
  );

  return (
    <Form
      leafs={leafs}
      schema={schema}
      onSubmit={console.log}
      onChange={console.log}
      uiSchema={{
        password: {
          ui: {
            component: PasswordMantine,
          },
        },
        age: {
          ui: {
            label: "Age",
            autoFocus: true,
          },
        },
        firstName: {
          ui: {
            label: "First name",
          },
        },
        details: {
          ui: {
            label: "Details",
          },
          address: {
            ui: {
              label: "Address",
            },
          },
        },
      }}
    />
  );
}

export function UiOptions() {
  const [schema] = React.useState(() =>
    z.object({
      firstName: z.string().min(1, "Required"),
      lastName: z.string().min(1, "Required"),
      telephone: z.string().optional(),
    })
  );

  return (
    <Form
      onSubmit={console.log}
      schema={schema}
      leafs={leafs}
      uiSchema={{
        firstName: {
          ui: {
            autoFocus: true,
            label: "First name",
          },
        },
        lastName: {
          ui: {
            label: "Last name",
          },
        },
        telephone: {
          ui: {
            label: "Telephone",
          },
        },
      }}
    />
  );
}

export function Nested() {
  const [schema] = React.useState(() =>
    z.object({
      title: z.string(),
      tasks: z
        .array(
          z.object({
            title: z.string().describe("A sample title"),
            details: z.string().optional().describe("Enter the task details"),
            done: z.boolean().optional().default(false),
          })
        )
        .describe("A list of tasks"),
    })
  );

  return (
    <Form
      title={<h1>A list of tasks</h1>}
      onSubmit={console.log}
      schema={schema}
      leafs={leafs}
      uiSchema={{
        title: {
          ui: {
            label: "Task list title",
          },
        },
      }}
    />
  );
}
