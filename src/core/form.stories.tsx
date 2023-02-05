import React from "react";
import * as R from "remeda";
import { Form, UiSchema } from "./form";
import { z } from "zod";
import {
  PasswordMantine,
  StringMantine,
  TextareaMantine,
} from "../components/mantine/string-mantine";
import {
  EnumMantine,
  EnumMantineRadio,
} from "../components/mantine/enum-mantine";
import {
  NumberMantine,
  SliderMantine,
} from "../components/mantine/number-mantine";
import { BooleanMantine } from "../components/mantine/boolean-mantine";
import {
  ObjectMantine,
  ObjectMantineRows,
} from "../components/mantine/object-mantine";
import { Alert, Box, Button, List } from "@mantine/core";
import { IObjectDefaultProps } from "../components/default/object-default";
import { MultiChoiceMantine } from "../components/mantine/multi-choice-mantine";
import { ArrayMantine } from "../components/mantine/array-mantine";

const components = {
  string: StringMantine,
  enum: EnumMantine,
  number: NumberMantine,
  boolean: BooleanMantine,
  object: ObjectMantine,
  multiChoice: MultiChoiceMantine,
  array: ArrayMantine,
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
        components={components}
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
        components={components}
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
      courses: z
        .array(
          z.enum(["Math", "Science", "English", "History"] as const, {
            required_error: "Please select a course",
          })
        )
        .min(2, "Please select at least 2 courses"),
      rating: z.number().min(0).max(100),
      additionalComments: z.string().optional(),
    })
  );

  const AddressComponent = React.useCallback(
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
        component: AddressComponent,
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
      component: TextareaMantine,
    },

    courses: {
      label: "Courses",
      component: MultiChoiceMantine,
    },

    rating: {
      component: SliderMantine,
      label: "Rating",
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
        components={components}
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

export function DonationForm() {
  const [schema] = React.useState(() =>
    z.object({
      fullName: z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
      }),
      email: z.string().email().describe("myname@example.com"),
      phoneNumber: z
        .string()
        .min(1, "Phone number is required")
        .describe('e.g. "+1 555 555 5555"'),
      donationType: z.enum(["oneTime", "monthly"] as const, {
        required_error: "Please select a donation type",
      }),
      comments: z.string().optional(),
      donationAmount: z
        .number()
        .min(0.01, "Donation should be larger than zero")
        .describe("Please enter your donation amount"),
      paymentMethod: z.enum(["creditCard", "payPal"] as const, {
        required_error: "Please select a payment method",
      }),
    })
  );

  const [uiSchema] = React.useState<UiSchema<typeof schema>>(() => ({
    fullName: {
      firstName: {
        label: "First name",
      },
      lastName: {
        label: "Last name",
      },
      ui: {
        title: "Full name",
        component: ObjectMantineRows,
      },
    },

    email: {
      label: "Email",
    },

    phoneNumber: {
      label: "Phone number",
    },

    donationType: {
      component: EnumMantineRadio,
      label: "Donation type",
      optionLabels: {
        monthly: "Monthly",
        oneTime: "One time",
      },
    },

    comments: {
      label: "Comments",
    },

    donationAmount: {
      label: "Donation amount",
    },

    paymentMethod: {
      component: EnumMantineRadio,
      label: "Payment method",
      optionLabels: {
        creditCard: <span>💳 Credit card</span>,
        payPal: <span>🐧 PayPal</span>,
      },
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
        components={components}
        title={<h1>Donation form</h1>}
        schema={schema}
        uiSchema={uiSchema}
      >
        {() => <Button type="submit">Submit</Button>}
      </Form>
    </div>
  );
}

export function ConferenceRegistration() {
  const PersonComponent = React.useCallback((props: IObjectDefaultProps) => {
    return (
      <ObjectMantine {...props}>
        <Box
          sx={{
            display: "grid",
            gap: 8,
          }}
        >
          {props.children}
        </Box>
      </ObjectMantine>
    );
  }, []);

  const [schema] = React.useState(() =>
    z.object({
      people: z
        .array(
          z.object({
            fullName: z.object({
              firstName: z.string().min(1, "First name is required"),
              lastName: z.string().min(1, "Last name is required"),
            }),
            email: z.string().email().describe("myname@example.com"),
            phoneNumber: z.string().describe('e.g. "+1 555 555 5555"'),
          })
        )
        .min(1, "Please add at least one person"),

      products: z
        .array(z.enum(["tShirt", "coffeeCup"] as const))
        .min(1, "Please select a product"),
      paymentMethod: z.enum(["creditCard", "payPal"] as const),

      paypalNumber: z.string().optional(),
    })
  );

  const [uiSchema] = React.useState<UiSchema<typeof schema>>(() => ({
    people: {
      element: {
        ui: {
          title: "Attendee",
          component: PersonComponent,
        },
        fullName: {
          ui: {
            component: ObjectMantineRows,
          },
          firstName: {
            label: "First name",
          },
          lastName: {
            label: "Last name",
          },
        },
        email: {
          label: "Email",
        },
        phoneNumber: {
          label: "Phone number",
        },
      },
    },
    products: {
      title: "Products",
      optionLabels: {
        coffeeCup: "Coffee cup",
        tShirt: "T-shirt",
      },
    },
    paymentMethod: {
      component: EnumMantineRadio,
      label: "Payment method",
      optionLabels: {
        creditCard: <span>💳 Credit card</span>,
        payPal: <span>🐧 PayPal</span>,
      },
    },
    paypalNumber: {
      label: "PayPal number",
      cond: (formData) => formData.paymentMethod === "payPal",
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
        onSubmit={console.log}
        components={components}
        title={<h1>Conference registration</h1>}
        schema={schema}
        uiSchema={uiSchema}
      >
        {({ errors }) => {
          return (
            <React.Fragment>
              {errors.length > 0 && (
                <Alert color="red" title="Please fix the following errors:">
                  <List>
                    {errors.map(([, error]) => (
                      <List.Item c="red">{error[0]?.message}</List.Item>
                    ))}
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
