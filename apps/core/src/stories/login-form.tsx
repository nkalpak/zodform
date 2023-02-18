import { z } from 'zod';
import { Form, FormUiSchema } from '../core/form';

const schema = z.object({
  email: z.string().email()
});

const uiSchema: FormUiSchema<typeof schema> = {
  email: {
    label: 'Email'
  }
};

export function LoginForm() {
  return <Form schema={schema} uiSchema={uiSchema} />;
}
