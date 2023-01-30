import React from "react";
import * as R from "remeda";
import { Form, UiSchema } from "./form";
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
      >
        {() => (
          <Button type="submit" color="blue">
            Login
          </Button>
        )}
      </Form>
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
      >
        {() => (
          <Button type="submit" color="blue">
            Register
          </Button>
        )}
      </Form>
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

const dayOptions = R.range(1, 32).map((n) => n.toString()) as [
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
            gap: 8,

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

  const [uiSchema] = React.useState<UiSchema<typeof schema>>(() => ({
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
  }));

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
        uiSchema={uiSchema}
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
