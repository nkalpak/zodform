import type { AnyZodObject, ZodString } from "zod";
import * as zod from "zod";
import * as R from "remeda";
import { ZodAny } from "zod";
import { parseObjectFromFlattenedEntries } from "../utils/parse-object-from-flattened-names";
import { nn } from "../utils/invariant";
import React from "react";
import { createContext } from "../utils/create-context";

type ComponentName = string;
type ErrorsMap = Record<ComponentName, zod.ZodIssue[]>;

const [useFormErrors, FormErrorsProvider] = createContext<{
  errors?: ErrorsMap;
}>();

function getZodTypeNameFromSchema(schema: unknown): string | undefined {
  // @ts-expect-error
  return schema?._def?.typeName;
}

function isZodString(schema: unknown): schema is ZodString {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodString";
}

function isZodObject(schema: unknown): schema is AnyZodObject {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodObject";
}

function ZodStringComponent({
  schema,
  name,
}: {
  schema: ZodString;
  name: string;
}) {
  const { errors } = useFormErrors();
  const thisErrors = errors?.[name];

  return (
    <div>
      <input type="text" name={name} />

      {thisErrors
        ? thisErrors.map((error) => (
            <div style={{ color: "red" }} key={error.code}>
              {error.message}
            </div>
          ))
        : null}
    </div>
  );
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

  if (R.isNil(name)) {
    return null;
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
  const [errors, setErrors] = React.useState<ErrorsMap>();

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
          setErrors(undefined);
          onSubmit?.(parsed.data);
        } else {
          setErrors(() =>
            R.groupBy(parsed.error.errors, (item) => item.path.join("."))
          );
        }
      }}
    >
      <FormErrorsProvider value={{ errors }}>
        <ZodComponent schema={schema} />
      </FormErrorsProvider>

      <button type="submit">Submit</button>
    </form>
  );
}
