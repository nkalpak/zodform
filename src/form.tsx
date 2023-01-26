import type { AnyZodObject, ZodString } from "zod";
import * as zod from "zod";
import { isNil } from "remeda";

function isZodString(schema: unknown): schema is ZodString {
  const typeName = schema?._def?.typeName;
  if (isNil(typeName)) {
    throw new Error("Invalid schema");
  }

  return typeName === "ZodString";
}

function FormString({ schema, name }: { schema: ZodString; name: string }) {
  return <input type="text" name={name} />;
}

interface IFormProps<Schema extends AnyZodObject> {
  schema: Schema;
  onSubmit?: (values: zod.infer<Schema>) => void;
}

export function Form<Schema extends AnyZodObject>({
  schema,
  onSubmit,
}: IFormProps<Schema>) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const values = Object.fromEntries(
          new FormData(event.target as HTMLFormElement).entries()
        );

        const parsed = schema.safeParse(values);
        if (parsed.success) {
          onSubmit?.(parsed.data);
        } else {
          console.log(parsed.error);
        }
      }}
    >
      {Object.entries(schema.shape).map(([key, value]) => {
        if (isZodString(value)) {
          return <FormString name={key} key={key} schema={value} />;
        }
      })}

      <button type="submit">Submit</button>
    </form>
  );
}
