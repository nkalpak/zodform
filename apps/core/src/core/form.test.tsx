import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Form } from './form';
import { z } from 'zod';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { ObjectDefault } from '../components/default/object-default';
import { NumberDefault } from '../components/default/number-default';
import { MultiChoiceDefault } from '../components/default/multi-choice-default';
import { StringDefault } from '../components/default/string-default';

function renderSimpleArray() {
  const user = userEvent.setup();
  const schema = z.object({
    fruits: z.array(z.string())
  });
  const addTestId = 'add-test-id';
  const removeTestId = 'remove-test-id';
  const elementTestId = 'element-test-id';

  const screen = render(
    <Form
      schema={schema}
      components={{
        string: (props) => {
          return (
            <React.Fragment>
              <StringDefault {...props} />
              <span data-testid={elementTestId} />
            </React.Fragment>
          );
        }
      }}
      uiSchema={{
        fruits: {
          element: {
            label: 'fruits'
          },
          component: (props) => (
            <div>
              {props.children.map((child, index) => (
                <div key={index}>
                  {child}{' '}
                  <button
                    type="button"
                    data-testid={removeTestId}
                    onClick={() => {
                      props.onRemove(index);
                    }}
                  >
                    -
                  </button>
                </div>
              ))}
              <button type="button" data-testid={addTestId} onClick={props.onAdd}>
                +
              </button>
            </div>
          )
        }
      }}
    />
  );

  return { screen, user, addTestId, removeTestId, elementTestId };
}

describe('Form', function () {
  test('should remove the property when the text field is cleared and the schema is optional', async function () {
    const user = userEvent.setup();
    const schema = z.object({
      name: z.string().min(3).optional()
    });
    const onSubmit = vi.fn();

    const NAME = 'John doe';
    const LABEL = 'Name';

    const screen = render(
      <Form
        onSubmit={onSubmit}
        schema={schema}
        uiSchema={{
          name: {
            label: LABEL
          }
        }}
      />
    );
    await user.type(screen.getByLabelText(LABEL), NAME);
    expect(screen.getByLabelText(LABEL)).toHaveValue(NAME);

    await user.clear(screen.getByLabelText(LABEL));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toBeCalledWith({});
  });

  test('number input submits when valid', async function () {
    const user = userEvent.setup();
    const schema = z.object({
      age: z.number()
    });
    const onSubmit = vi.fn();

    const AGE = 18;

    const screen = render(<Form onSubmit={onSubmit} schema={schema} />);
    await user.type(screen.getByLabelText('age'), AGE.toString());
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toBeCalledWith({ age: AGE });
  });

  test('submit empty number field when optional', async function () {
    const user = userEvent.setup();
    const schema = z.object({
      age: z.number().optional()
    });
    const onSubmit = vi.fn();

    const screen = render(<Form onSubmit={onSubmit} schema={schema} />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toBeCalledWith({});
  });

  test('empty, optional number input is submittable after type & clear', async function () {
    const user = userEvent.setup();
    const schema = z.object({
      age: z.number().optional()
    });
    const onSubmit = vi.fn();

    const screen = render(<Form onSubmit={onSubmit} schema={schema} />);
    await user.type(screen.getByLabelText('age'), '18');
    await user.clear(screen.getByLabelText('age'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toBeCalledWith({});
  });

  test('field labels render when provided through uiSchema', async function () {
    const schema = z.object({
      age: z.number().optional(),
      name: z.string(),
      gender: z.enum(['male', 'female', 'other'] as const),
      isAccepted: z.boolean(),
      address: z.object({
        street: z.string(),
        city: z.object({
          name: z.string(),
          zip: z.string()
        })
      }),
      hobbies: z.array(z.string()).min(1)
    });

    const screen = render(
      <Form
        schema={schema}
        uiSchema={{
          age: {
            label: 'Age'
          },
          name: {
            label: 'Name'
          },
          gender: {
            label: 'Gender'
          },
          address: {
            street: {
              label: 'Street'
            },
            city: {
              name: {
                label: 'City'
              }
            }
          },
          hobbies: {
            element: {
              label: 'Hobby'
            }
          },
          isAccepted: {
            label: 'Accept'
          }
        }}
      />
    );

    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Street')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('Hobby')).toBeInTheDocument();
    expect(screen.getByLabelText('Accept')).toBeInTheDocument();
  });

  test('object ui properties', async function () {
    const schema = z.object({
      address: z.object({
        street: z.string(),
        city: z.string()
      })
    });

    const testId = 'test-id';

    const screen = render(
      <Form
        schema={schema}
        uiSchema={{
          address: {
            ui: {
              title: 'Address',
              component: (props) => (
                <ObjectDefault {...props}>
                  {props.children} <span data-testid={testId}>h</span>
                </ObjectDefault>
              )
            }
          }
        }}
      />
    );

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  test('object as an array element', async function () {
    const schema = z.object({
      people: z
        .array(
          z.object({
            age: z.number()
          })
        )
        .min(1)
    });

    const ageId = 'age-id';
    const personId = 'person-id';

    const screen = render(
      <Form
        schema={schema}
        uiSchema={{
          people: {
            element: {
              age: {
                label: 'Name',
                component: (props) => (
                  <React.Fragment>
                    <NumberDefault {...props} />
                    <span data-testid={ageId}>h</span>
                  </React.Fragment>
                )
              },
              ui: {
                title: 'Person',
                component: (props) => (
                  <ObjectDefault {...props}>
                    {props.children} <span data-testid={personId}>h</span>
                  </ObjectDefault>
                )
              }
            }
          }
        }}
      />
    );

    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByTestId(ageId)).toBeInTheDocument();
    expect(screen.getByTestId(personId)).toBeInTheDocument();
  });

  test('array with N elements schema generates N elements by default', async function () {
    const schema = z.object({
      fruits: z.array(z.string()).length(2)
    });

    const screen = render(
      <Form
        schema={schema}
        uiSchema={{
          fruits: {
            element: {
              label: 'fruits'
            }
          }
        }}
      />
    );

    expect(screen.getAllByLabelText('fruits')).toHaveLength(2);
  });

  test('array add element', async function () {
    const { user, addTestId, screen, elementTestId } = renderSimpleArray();

    await user.click(screen.getByTestId(addTestId));

    expect(screen.getAllByTestId(elementTestId)).toHaveLength(1);
  });

  test('array remove element', async function () {
    const { user, removeTestId, addTestId, screen } = renderSimpleArray();

    await user.click(screen.getByTestId(addTestId));
    await user.click(screen.getByTestId(removeTestId));

    expect(screen.queryAllByLabelText('fruits')).toHaveLength(0);
  });

  test('array enum element', async function () {
    const schema = z.object({
      fruits: z.array(z.enum(['apple', 'banana', 'citrus']))
    });
    const testId = 'test-id';

    const screen = render(
      <Form
        schema={schema}
        uiSchema={{
          fruits: {
            label: 'Fruits',
            component: (props) => (
              <React.Fragment>
                <MultiChoiceDefault {...props} />
                <span data-testid={testId}>h</span>
              </React.Fragment>
            ),
            optionLabels: {
              banana: 'Banana',
              apple: 'Apple',
              citrus: 'Citrus'
            }
          }
        }}
      />
    );

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Citrus')).toBeInTheDocument();
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
