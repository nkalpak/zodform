import React from "react";
import { Form } from "./form";
import { z } from "zod";

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
    })
  );

  return (
    <Form
      schema={schema}
      onSubmit={console.log}
      onChange={console.log}
      uiSchema={{
        age: {
          ui_label: "Age",
        },
        firstName: {
          ui_label: "First name",
          ui_component: ({ name, value, onChange }) => {
            return (
              <input
                name={name}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="First name"
              />
            );
          },
        },
        details: {
          ui_label: "Details",
          address: {
            ui_label: "Address",
          },
        },
      }}
    />
  );
}
