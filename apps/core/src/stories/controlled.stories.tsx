import React from 'react';
import { z } from 'zod';
import { Form, FormOnChange, FormUiSchema, FormValue } from '../core/form';

export function ControlledForm() {
  const [schema] = React.useState(
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

      paypalNumber: z.string().optional(),

      isAccepting: z.boolean(),
      age: z.number(),
      future: z.date()
    })
  );

  const [uiSchema] = React.useState<FormUiSchema<typeof schema>>(() => ({
    age: {
      cond: (data) => data.isAccepting === true
    },
    paypalNumber: {
      cond: (data) => data.paymentMethod === 'payPal'
    }
  }));

  const [value, setValue] = React.useState<FormValue<typeof schema>>({
    people: [
      {
        email: '',
        fullName: {
          firstName: '',
          lastName: ''
        },
        phoneNumber: ''
      }
    ]
  });

  const onChange: FormOnChange<typeof schema> = React.useCallback((updater) => {
    setValue((prevState) => {
      const newState = updater(prevState);
      if (newState.age === 18) {
        return {
          ...newState,
          isAccepting: true
        };
      }
      return newState;
    });
  }, []);

  return (
    <div
      style={{
        width: 500,
        margin: 'auto'
      }}
    >
      <Form schema={schema} uiSchema={uiSchema} value={value} onChange={onChange} onSubmit={console.log} />
    </div>
  );
}
