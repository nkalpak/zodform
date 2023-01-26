import type { AnyZodObject, ZodString } from "zod";
import * as zod from "zod";
import { isNil } from "remeda";
import { ZodAny } from "zod";
import { parseObjectFromFlattenedEntries } from "./utils/parse-object-from-flattened-names";

function isZodString(schema: unknown): schema is ZodString {
  const typeName = schema?._def?.typeName;
  if (isNil(typeName)) {
    throw new Error("Invalid schema");
  }

  return typeName === "ZodString";
}

function isZodObject(schema: unknown): schema is AnyZodObject {
  const typeName = schema?._def?.typeName;
  if (isNil(typeName)) {
    throw new Error("Invalid schema");
  }

  return typeName === "ZodObject";
}

function ZodStringComponent({
  schema,
  name,
}: {
  schema: ZodString;
  name?: string;
}) {
  return <input type="text" name={name} />;
}

function ZodComponent({ schema, name }: { schema: ZodAny; name?: string }) {
  if (isZodObject(schema)) {
    return (
      <div>
        {Object.entries(schema.shape).map(([key, value]) => {
          const uniqueName = name ? [name, key].join(".") : key;
          return (
            <ZodComponent key={uniqueName} name={uniqueName} schema={value} />
          );
        })}
      </div>
    );
  }

  if (isZodString(schema)) {
    return <ZodStringComponent schema={schema} name={name} />;
  }

  return null;
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

        const entries = Array.from(
          new FormData(event.target as HTMLFormElement).entries()
        );

        const parsed = schema.safeParse(
          parseObjectFromFlattenedEntries(entries)
        );
        if (parsed.success) {
          onSubmit?.(parsed.data);
        } else {
          console.log(parsed.error);
        }
      }}
    >
      <ZodComponent schema={schema} />

      <button type="submit">Submit</button>
    </form>
  );
}
