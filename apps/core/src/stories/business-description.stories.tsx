import { z } from 'zod';
import { Form, FormUiSchema, useForm } from '../core/form';
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
  template: templateSchema,
  description: z.string().min(1, 'The description must not be empty')
});

const uiSchema: FormUiSchema<typeof schema> = {
  template: {
    label: 'Template',
    Component: (props) => {
      const form = useForm<typeof schema>();

      return (
        <EnumDefault
          {...props}
          onChange={(value) => {
            form.update((old) => {
              if (value) {
                old.description = TEMPLATE_DESCRIPTIONS[value as z.infer<typeof templateSchema>];
              }
            });
            props.onChange(value);
          }}
        />
      );
    }
  },
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
      <Form schema={schema} uiSchema={uiSchema} />
    </div>
  );
}
