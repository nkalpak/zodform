import { z } from 'zod';
import { Form, FormUiSchema, useForm } from '../core/form';
import { StringDefault } from '../components/default/string-default';
import { parseArrayIndicesFromName } from '../core/parse-array-indices-from-name';

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
      name: {
        Component: (props) => {
          const form = useForm<typeof schema>();
          const membersIndex = parseArrayIndicesFromName(props.name, 'members');

          return (
            <StringDefault
              {...props}
              onChange={(value) => {
                if (membersIndex == null) {
                  return;
                }

                props.onChange(value);

                form.update((old) => {
                  const target = old.members?.[membersIndex];
                  if (target == null) {
                    return;
                  }
                  if (value === 'john') {
                    target.age = 30;
                    target.profession = 'developer';
                    target.city = 'Stockholm';
                    target.name = value;
                  }
                });
              }}
            />
          );
        }
      }
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
