import { z } from 'zod';
import { Form, FormUiSchema } from '../core/form';

const schema = z.object({
  members: z
    .array(
      z.object({
        name: z.string(),
        age: z.number(),
        profession: z.string(),
        city: z.string()
      })
    )
    .min(1)
});

const uiSchema: FormUiSchema<typeof schema> = {
  members: {
    element: {
      name: {}
    }
  }
};

export function Board() {
  return (
    <div
      style={{
        maxWidth: 500,
        margin: 'auto'
      }}
    >
      <Form onSubmit={console.log} schema={schema} uiSchema={uiSchema} />
    </div>
  );
}
