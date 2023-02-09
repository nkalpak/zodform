import React from 'react';
import { z } from 'zod';
import { IObjectDefaultProps, ObjectDefault } from '../components/default/object-default';
import { EnumDefault } from '../components/default/enum-default';
import { Form, FormUiSchema } from '../core/form';

export function ConferenceRegistration() {
  const [liveValidate, setLiveValidate] = React.useState(false);

  const PersonComponent = React.useCallback((props: IObjectDefaultProps) => {
    return (
      <ObjectDefault {...props}>
        <div
          style={{
            display: 'grid',
            gap: 8
          }}
        >
          {props.children}
        </div>
      </ObjectDefault>
    );
  }, []);

  const [schema] = React.useState(() =>
    z.object({
      people: z
        .array(
          z.object({
            fullName: z.object({
              firstName: z.string().min(1, 'First name is required'),
              lastName: z.string().min(1, 'Last name is required')
            }),
            email: z.string().email().describe('myname@example.com'),
            phoneNumber: z.string().describe('e.g. "+1 555 555 5555"')
          })
        )
        .min(1, 'Please add at least one person'),

      products: z.array(z.enum(['tShirt', 'coffeeCup'] as const)).min(1, 'Please select a product'),
      paymentMethod: z.enum(['creditCard', 'payPal'] as const),

      paypalNumber: z.string().optional()
    })
  );

  const [uiSchema] = React.useState<FormUiSchema<typeof schema>>(() => ({
    people: {
      element: {
        ui: {
          title: 'Attendee',
          component: PersonComponent
        },
        fullName: {
          ui: {
            component: ObjectDefault
          },
          firstName: {
            label: 'First name'
          },
          lastName: {
            label: 'Last name'
          }
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
      title: 'Products',
      optionLabels: {
        coffeeCup: 'Coffee cup',
        tShirt: 'T-shirt'
      }
    },
    paymentMethod: {
      component: EnumDefault,
      label: 'Payment method',
      optionLabels: {
        creditCard: <span>💳 Credit card</span>,
        payPal: <span>🐧 PayPal</span>
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
        confirmPassword: z.string()
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
      <Form liveValidate={false} schema={schema} onSubmit={console.log}>
        {({ errors }) => {
          return (
            <React.Fragment>
              {errors.length > 0 && (
                <ul>
                  {errors.map(([key, error]) => (
                    <li key={key}>{error[0]?.message}</li>
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
