import React from "react";
import { z } from "zod";
import { Form, UiSchema } from "../core/form";
import { mantineComponents } from "./form.stories";
import * as Mantine from "@mantine/core";
import { ObjectMantine } from "../components/mantine/object-mantine";
import { Button } from "@mantine/core";

export function Stepper() {
  const [schema] = React.useState(
    z.object({
      stepper: z.object({
        step: z.number().default(0),

        basic: z.object({
          firstName: z.string(),
          lastName: z.string(),
        }),

        address: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
        }),
      }),
    })
  );

  const [uiSchema] = React.useState<UiSchema<typeof schema>>({
    stepper: {
      ui: {
        component: (props) => {
          console.log(props.value);

          return (
            <ObjectMantine {...props}>
              {props.children}
              <Button
                sx={{ marginTop: 16 }}
                onClick={() => {
                  props.onChange({
                    step: (props.value?.step ?? 0) + 1,
                  });
                }}
              >
                Next
              </Button>
            </ObjectMantine>
          );
        },
      },
      step: {
        component: (props) => {
          return (
            <Mantine.Stepper
              active={props.value ?? 0}
              onStepClick={props.onChange}
            >
              <Mantine.Stepper.Step title="Basic" />

              <Mantine.Stepper.Step title="Address" />
            </Mantine.Stepper>
          );
        },
      },
      address: {
        ui: {
          cond: (data) => data.stepper?.step === 1,
        },
      },
      basic: {
        ui: {
          cond: (data) => data.stepper?.step === 0,
        },
        lastName: {
          label: "Last name",
        },
        firstName: {
          label: "First name",
        },
      },
    },
  });

  return (
    <div
      style={{
        width: 500,
        margin: "auto",
      }}
    >
      <Form
        onSubmit={console.log}
        schema={schema}
        components={mantineComponents}
        uiSchema={uiSchema}
      />
    </div>
  );
}
