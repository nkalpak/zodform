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

type ZodAnyEnum = zod.ZodEnum<[any]>;
function isZodEnum(schema: unknown): schema is ZodAnyEnum {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodEnum";
}

type ZodAnyArray = zod.ZodArray<any>;
function isZodArray(schema: unknown): schema is ZodAnyArray {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodArray";
}

function ComponentErrors({ name }: { name: string }) {
  const { errors } = useFormErrors();
  const thisErrors = errors?.[name];

  return (
    <React.Fragment>
      {thisErrors
        ? thisErrors.map((error) => (
            <div style={{ color: "red" }} key={error.code}>
              {error.message}
            </div>
          ))
        : null}
    </React.Fragment>
  );
}

function ZodStringComponent({
  schema,
  name,
}: {
  schema: ZodString;
  name: string;
}) {
  return (
    <div>
      <input type="text" name={name} />

      <ComponentErrors name={name} />
    </div>
  );
}

function ZodEnumComponent({
  schema,
  name,
}: {
  schema: ZodAnyEnum;
  name: string;
}) {
  return (
    <div>
      <select name={name}>
        {schema.options.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>

      <ComponentErrors name={name} />
    </div>
  );
}

function ZodArrayComponent({
  schema,
  name,
}: {
  schema: ZodAnyArray;
  name: string;
}) {
  const [items, setItems] = React.useState<ZodAny[]>([]);

  return (
    <div>
      {items.map((item, index) => {
        const uniqueName = `${name}[${index}]`;
        return (
          <ZodAnyComponent key={uniqueName} name={uniqueName} schema={item} />
        );
      })}

      <button
        type="button"
        onClick={() => {
          setItems([...items, schema.element]);
        }}
      >
        Add
      </button>

      <ComponentErrors name={name} />
    </div>
  );
}

function ZodAnyComponent({ schema, name }: { schema: ZodAny; name?: string }) {
  if (isZodObject(schema)) {
    return (
      <div>
        {Object.entries(schema.shape).map(([key, value]) => {
          const uniqueName = name ? [name, key].join(".") : key;
          return (
            <ZodAnyComponent
              key={uniqueName}
              name={uniqueName}
              schema={value}
            />
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

  if (isZodEnum(schema)) {
    return <ZodEnumComponent schema={schema} name={name} />;
  }

  if (isZodArray(schema)) {
    return <ZodArrayComponent schema={schema} name={name} />;
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

        const tmp = parseObjectFromFlattenedEntries(entries);

        const parsed = schema.safeParse(tmp);

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
        <ZodAnyComponent schema={schema} />
      </FormErrorsProvider>

      <button type="submit">Submit</button>
    </form>
  );
}
