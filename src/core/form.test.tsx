import { describe, expect, test, vi } from "vitest";
import { render } from "@testing-library/react";
import { Form } from "./form";
import { z } from "zod";
import React from "react";
import userEvent from "@testing-library/user-event";

describe("Form", function () {
  test("should remove the property when the text field is cleared and the schema is optional", async function () {
    const user = userEvent.setup();
    const schema = z.object({
      name: z.string().min(3).optional(),
    });
    const onSubmit = vi.fn();

    const NAME = "John doe";
    const LABEL = "Name";

    const screen = render(
      <Form
        onSubmit={onSubmit}
        schema={schema}
        uiSchema={{
          name: {
            ui: {
              label: LABEL,
            },
          },
        }}
      />
    );
    await user.type(screen.getByLabelText(LABEL), NAME);
    expect(screen.getByLabelText(LABEL)).toHaveValue(NAME);

    await user.clear(screen.getByLabelText(LABEL));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toBeCalledWith({});
  });

  test("number input submits when valid", async function () {
    const user = userEvent.setup();
    const schema = z.object({
      age: z.coerce.number().min(18).optional(),
    });
    const onSubmit = vi.fn();

    const AGE = 18;
    const LABEL = "Age";

    const screen = render(
      <Form
        onSubmit={onSubmit}
        schema={schema}
        uiSchema={{
          age: {
            ui: {
              label: LABEL,
            },
          },
        }}
      />
    );
    await user.type(screen.getByLabelText(LABEL), AGE.toString());
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toBeCalledWith({ age: 18 });
  });
});
