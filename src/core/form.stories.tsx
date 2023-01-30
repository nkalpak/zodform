import React from "react";
import * as R from "remeda";
import { Form } from "./form";
import { z } from "zod";
import {
  PasswordMantine,
  StringMantine,
} from "../components/mantine/string-mantine";
import { EnumMantine } from "../components/mantine/enum-mantine";
import { NumberMantine } from "../components/mantine/number-mantine";
import { BooleanMantine } from "../components/mantine/boolean-mantine";
import {
  ObjectMantine,
  ObjectMantineRows,
} from "../components/mantine/object-mantine";
import { Alert, Box, Button, List } from "@mantine/core";
import { IObjectDefaultProps } from "../components/default/object-default";

const leafs = {
  string: StringMantine,
  enum: EnumMantine,
  number: NumberMantine,
  boolean: BooleanMantine,
  object: ObjectMantine,
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
      uiSchema={{
        password: {
          component: PasswordMantine,
        },
        age: {
          label: "Age",
          autoFocus: true,
        },
        firstName: {
          label: "First name",
        },
        details: {
          address: {
            label: "Address",
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
      telephone: z.string().min(5).optional(),
      age: z.number(),
    })
  );

  return (
    <Form
      onSubmit={console.log}
      schema={schema}
      // leafs={leafs}
      uiSchema={{
        firstName: {
          autoFocus: true,
          label: "First name",
        },
        lastName: {
          label: "Last name",
        },
        telephone: {
          label: "Telephone",
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
      stuff: z.array(z.string()).optional(),
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
          label: "Task list title",
        },
        tasks: {
          title: <h2 style={{ marginBottom: 4 }}>Tasks</h2>,
        },
      }}
    />
  );
}

export function Login() {
  const [schema] = React.useState(() =>
    z.object({
      email: z.string().email(),
      password: z
        .string()
        .describe("Make sure that your password is strong")
        .regex(
          /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
          "Password not strong enough"
        ),
    })
  );

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <Form
        title={<h1>Login</h1>}
        schema={schema}
        leafs={leafs}
        uiSchema={{
          email: {
            label: "Email",
          },
          password: {
            label: "Password",
            component: PasswordMantine,
          },
        }}
      />
    </div>
  );
}

export function Register() {
  const [schema] = React.useState(() =>
    z
      .object({
        email: z.string().email(),
        password: z.string(),
        confirmPassword: z.string(),
      })
      .refine((data) => data.confirmPassword === data.password, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
      })
  );

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <Form
        title={<h1>Register</h1>}
        schema={schema}
        leafs={leafs}
        uiSchema={{
          email: {
            label: "Email",
          },
          password: {
            label: "Password",
            component: PasswordMantine,
          },
          confirmPassword: {
            label: "Confirm password",
            component: PasswordMantine,
          },
        }}
      />
    </div>
  );
}

const monthOptions: [string, ...string[]] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayOptions = R.range(0, 32).map((n) => n.toString()) as [
  string,
  ...string[]
];

const yearOptions = R.range(1980, 2021).map((n) => n.toString()) as [
  string,
  ...string[]
];

export function StudentRegistration() {
  const [schema] = React.useState(() =>
    z.object({
      studentName: z.object({
        firstName: z.string().min(1, "First name is required"),
        middleName: z.string().optional(),
        lastName: z.string().min(1, "Last name is required"),
      }),
      birthDate: z.object({
        month: z.enum(monthOptions, {
          required_error: "Please select a birth month",
        }),
        day: z.enum(dayOptions, {
          required_error: "Please select a birth day",
        }),
        year: z.enum(yearOptions, {
          required_error: "Please select a birth year",
        }),
      }),
      gender: z.enum(["Male", "Female", "Other"] as const, {
        required_error: "Please select a gender",
      }),
      address: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().optional(),
        zip: z.string().min(1, "Zip is required"),
      }),
      email: z.string().email(),
      phone: z.string().min(1, "Phone is required"),
      courses: z.enum(["Math", "Science", "English", "History"] as const, {
        required_error: "Please select a course",
      }),
      additionalComments: z.string().optional(),
    })
  );

  const addressComponent = React.useCallback(
    (props: IObjectDefaultProps) => (
      <ObjectMantine {...props}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 8,

            "& :first-child, & :last-child": {
              gridColumn: "span 2",
            },
          }}
        >
          {props.children}
        </Box>
      </ObjectMantine>
    ),
    []
  );

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <Form
        title={<h1>Registration form</h1>}
        schema={schema}
        leafs={leafs}
        uiSchema={{
          studentName: {
            firstName: {
              label: "First name",
            },
            lastName: {
              label: "Last name",
            },
            middleName: {
              label: "Middle name",
            },
            ui: {
              title: "Student name",
              component: ObjectMantineRows,
            },
          },

          birthDate: {
            month: {
              label: "Month",
            },
            day: {
              label: "Day",
            },
            year: {
              label: "Year",
            },
            ui: {
              title: "Birth date",
              component: ObjectMantineRows,
            },
          },

          gender: {
            label: "Gender",
          },

          address: {
            ui: {
              title: "Address",
              component: addressComponent,
            },
            state: {
              label: "State",
            },
            city: {
              label: "City",
            },
            zip: {
              label: "Zip",
            },
            street: {
              label: "Street",
            },
          },

          email: {
            label: "Email",
          },

          additionalComments: {
            label: "Additional comments",
          },

          courses: {
            label: "Courses",
          },

          phone: {
            label: "Phone",
          },
        }}
      >
        {({ errors }) => {
          return (
            <React.Fragment>
              {errors.length > 0 && (
                <Alert title="Please resolve the errors" color="red">
                  <List>
                    {errors.map(([, errors]) =>
                      errors.map((error) => (
                        <List.Item c="red">{error.message}</List.Item>
                      ))
                    )}
                  </List>
                </Alert>
              )}

              <Button type="submit">Submit</Button>
            </React.Fragment>
          );
        }}
      </Form>
    </div>
  );
}
