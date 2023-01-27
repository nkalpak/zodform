import React from "react";
import { Form } from "./form";
import { z } from "zod";

export function Simple() {
  const [schema] = React.useState(() =>
    z.object({
      firstName: z.string().min(1, "Name must be at least 3 characters long"),
      lastName: z.string().min(1, "Name must be at least 3 characters long"),
      // Since HTML returns string for number inputs, we need to coerce the value
      age: z.coerce.number().min(1, "Age must be at least 1"),
      bio: z.string().optional(),
      password: z.string(),
      phoneNumber: z.string(),
    })
  );

  return <Form schema={schema} />;
}
