import { z } from 'zod';
import { Form, FormUiSchema } from '../core/form';
import { EnumDefault } from '../components/default/enum-default';

const templateSchema = z.enum([
  'No template',
  'Real estate company',
  'Holding company',
  'Construction activities'
] as const);

const TEMPLATE_DESCRIPTIONS: Record<z.infer<typeof templateSchema>, string> = {
  'No template': '',
  'Real estate company': 'A real estate company is a company that buys, sells, or rents real estate.',
  'Holding company': "A holding company is a company that owns other companies' outstanding stock.",
  'Construction activities':
    'Construction activities are the activities of building, repairing, and maintaining structures.'
};

const schema = z.object({
  description: z.string().min(1, 'The description must not be empty')
});

const uiSchema: FormUiSchema<typeof schema> = {
  description: {
    label: 'Description'
  }
};

export function BusinessDescription() {
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
