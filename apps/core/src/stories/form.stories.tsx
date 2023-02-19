import React from 'react';
import { z } from 'zod';
import { EnumDefault } from '../components/default/enum-default';
import { Form, FormUiSchema, useForm } from '../core/form';

interface IStringDefaultProps {
  bla: string;
}

export function ConferenceRegistration() {
  const [liveValidate, setLiveValidate] = React.useState(false);

  const [schema] = React.useState(() =>
    z.object({
      people: z
        .array(
          z.object({
            firstName: z.string().min(1, 'First name is required'),
            lastName: z.string().min(1, 'Last name is required'),
            email: z.string().email().describe('myname@example.com'),
            phoneNumber: z.string().describe('e.g. "+1 555 555 5555"')
          })
        )
        .min(1, 'Please add at least one person')
        .optional(),

      products: z.array(z.enum(['tShirt', 'coffeeCup'] as const)).min(1, 'Please select a product'),
      amount: z
        .enum(['25000', '50000'] as const)
        .transform((x) => parseInt(x))
        .describe('SEK')
        .default('25000' as const),

      paymentMethod: z
        .enum(['creditCard', 'payPal'] as const)
        .optional()
        .describe('A method'),

      paypalNumber: z.string().optional(),

      isAccepting: z.boolean(),
      age: z.number(),
      future: z.date()
    })
  );

  const [uiSchema] = React.useState<FormUiSchema<typeof schema>>(() => ({
    people: {
      element: {
        ui: {
          title: 'Attendee',
          Layout: ({ children, value }) => {
            const form = useForm<typeof schema>();

            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    form.update((old) => {
                      old.people![0]!.firstName = 'John';
                      old.people![0]!.lastName = 'Doe';
                    });
                  }}
                >
                  Do
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {children.firstName} {children.lastName}
                </div>
                {children.email} {children.phoneNumber}
                <div>
                  Who? {form.value.amount} {value.lastName}
                </div>
              </div>
            );
          }
        },
        firstName: {
          label: 'First name'
        },
        lastName: {
          label: 'Last name'
        },
        email: {
          label: 'Email'
        },
        phoneNumber: {
          label: 'Phone number'
        }
      }
    },
    products: {
      label: 'Products',
      optionLabels: {
        coffeeCup: 'Coffee cup',
        tShirt: 'T-shirt'
      }
    },
    paymentMethod: {
      component: EnumDefault,
      label: 'Payment method',
      optionLabels: {
        creditCard: '💳 Credit card',
        payPal: '🐧 PayPal'
      }
    },
    paypalNumber: {
      label: 'PayPal number',
      cond: (formData) => formData.paymentMethod === 'payPal'
    }
  }));

  return (
    <div
      style={{
        maxWidth: 500,
        margin: 'auto'
      }}
    >
      <Form
        liveValidate={liveValidate}
        onSubmit={console.log}
        title={<h1>Conference registration</h1>}
        schema={schema}
        uiSchema={uiSchema}
        onErrorsChange={(errors) => {
          const isInvalid = Object.keys(errors).length > 0;
          setLiveValidate(isInvalid);
        }}
      >
        {() => {
          return <button type="submit">Submit</button>;
        }}
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
        birthDate: z.date()
      })
      .refine(
        (data) => {
          return data.password === data.confirmPassword;
        },
        {
          message: 'Passwords do not match'
        }
      )
  );

  return (
    <div
      style={{
        width: 500,
        margin: 'auto'
      }}
    >
      <Form
        uiSchema={{
          birthDate: {
            label: 'Birth date'
          }
        }}
        liveValidate={false}
        schema={schema}
        onSubmit={console.log}
      >
        {({ errors }) => {
          return (
            <React.Fragment>
              {errors.length > 0 && (
                <ul>
                  {errors.map((error) => (
                    <li key={error.path.join('')}>{error.message}</li>
                  ))}
                </ul>
              )}

              <button type="submit">Submit</button>
            </React.Fragment>
          );
        }}
      </Form>
    </div>
  );
}
