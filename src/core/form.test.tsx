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

    const screen = render(
      <Form
        onSubmit={onSubmit}
        schema={schema}
        uiSchema={{
          name: {
            ui: {
              label: "Name",
            },
          },
        }}
      />
    );
    await user.type(screen.getByLabelText("Name"), "John doe");
    await user.clear(screen.getByLabelText("Name"));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toBeCalledWith({});
  });
});
