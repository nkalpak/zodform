import { describe, test } from 'vitest';
import { z, ZodType } from 'zod';
import { FormUiSchema } from './form';
import { resolveUiSchemaConds } from './resolve-ui-schema-conds';
import { PartialDeep } from 'type-fest';
import { ObjectMantineRows } from '../../../mantine/src/components/object-mantine';
import { EnumMantineRadio } from '../../../mantine/src/components/enum-mantine';
import React from 'react';

type CondFormData<Schema extends ZodType> = PartialDeep<z.infer<Schema>>;

describe('resolveUiSchemaConds', function () {
  test('resolves nested properties', function () {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      address: z.object({
        street: z.string(),
        fruits: z.array(z.enum(['apple', 'banana'] as const)),
        city: z.object({
          name: z.string()
        }),
        people: z.array(
          z.object({
            name: z.string(),
            age: z.number()
          })
        )
      })
    });

    function falseCond(formData: CondFormData<typeof schema>) {
      const age = formData.age ?? 0;
      return age < 10;
    }
    function trueCond(formData: CondFormData<typeof schema>) {
      const age = formData.age ?? 0;
      return age >= 10;
    }

    const uiSchema: FormUiSchema<typeof schema> = {
      name: {
        cond: falseCond
      },
      address: {
        ui: {
          cond: falseCond
        },
        street: {
          cond: falseCond
        },
        fruits: {
          cond: trueCond
        },
        city: {
          name: {
            cond: trueCond
          }
        },
        people: {
          element: {
            age: {
              cond: trueCond
            }
          }
        }
      }
    };

    const result = resolveUiSchemaConds({ uiSchema, formData: { age: 10 } });

    expect(result).toEqual(
      expect.arrayContaining([
        {
          path: ['name'],
          cond: false
        },
        {
          cond: false,
          path: ['address', 'street']
        },
        {
          cond: true,
          path: ['address', 'fruits']
        },
        {
          cond: false,
          path: ['address']
        },
        {
          cond: true,
          path: ['address', 'city', 'name']
        },
        {
          cond: true,
          path: ['address', 'people', 'age']
        }
      ])
    );
  });

  test('works', function () {
    const schema = z.object({
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
    });

    const uiSchema: FormUiSchema<typeof schema> = {
      people: {
        element: {
          ui: {
            title: 'Attendee'
          },
          fullName: {
            ui: {
              component: (props) => {
                return (
                  <ObjectMantineRows {...props}>
                    {props.children.firstName}
                    {props.children.lastName}
                  </ObjectMantineRows>
                );
              }
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
      paymentMethod: {
        component: EnumMantineRadio,
        label: 'Payment method',
        optionLabels: {
          creditCard: <span>💳 Credit card</span>,
          payPal: <span>🐧 PayPal</span>
        }
      },
      paypalNumber: {
        cond: (formData) => formData.paymentMethod === 'payPal'
      }
    };

    const result = resolveUiSchemaConds({
      uiSchema,
      formData: {}
    });

    expect(result).toEqual(
      expect.arrayContaining([
        {
          cond: false,
          path: ['paypalNumber']
        }
      ])
    );
  });
});
