import { describe, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Form, FormSchema } from './form';
import { z } from 'zod';
import userEvent from '@testing-library/user-event';

async function renderForm(schema: FormSchema) {
  const user = userEvent.setup();
  const fn = vi.fn();
  const testId = 'form';

  const screen = render(
    <Form schema={schema} onError={fn}>
      {() => (
        <button data-testid={testId} type="submit">
          Submit
        </button>
      )}
    </Form>
  );

  const button = screen.getByTestId(testId);
  expect(button).toBeInTheDocument();
  await user.click(button);

  return { fn };
}

describe('mapRhfErrors', function () {
  test('should map nested objects', async function () {
    const { fn } = await renderForm(
      z.object({
        person: z.object({
          firstName: z.string(),
          lastName: z.string(),
          address: z.object({
            street: z.object({
              name: z.string(),
              number: z.number()
            }),
            city: z.string()
          })
        })
      })
    );

    expect(fn).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'person.firstName'
        }),
        expect.objectContaining({
          name: 'person.lastName'
        }),
        expect.objectContaining({
          name: 'person.address.street.name'
        }),
        expect.objectContaining({
          name: 'person.address.street.number'
        }),
        expect.objectContaining({
          name: 'person.address.city'
        })
      ])
    );
  });

  test('should map simple array element', async function () {
    const { fn } = await renderForm(
      z.object({
        fruits: z.array(z.string()).min(1)
      })
    );

    expect(fn).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'fruits.0'
        })
      ])
    );
  });

  test('should map complex array element', async function () {
    const { fn } = await renderForm(
      z.object({
        dogs: z
          .array(
            z.object({
              dogName: z.string()
            })
          )
          .min(1)
      })
    );

    expect(fn).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'dogs.0.dogName'
        })
      ])
    );
  });

  test('should map simple error', async function () {
    const { fn } = await renderForm(
      z.object({
        firstName: z.string()
      })
    );

    expect(fn).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'firstName'
        })
      ])
    );
  });
});
