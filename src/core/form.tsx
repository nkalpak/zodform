import type { AnyZodObject, ZodFirstPartySchemaTypes, ZodString } from "zod";
import * as zod from "zod";
import * as R from "remeda";
import { parseObjectFromFlattenedEntries } from "../utils/parse-object-from-flattened-names";
import { nn } from "../utils/invariant";
import React from "react";
import { createContext } from "../utils/create-context";
import "../App.css";
import { componentNameDeserialize } from "../utils/component-name-deserialize";

type ComponentName = string;
type ErrorsMap = Record<ComponentName, zod.ZodIssue[]>;
type ComponentPath = (string | number)[];
type FormOnChange = (data: {
  value: string | number;
  path: ComponentPath;
}) => void;

const [useFormContext, FormContextProvider] = createContext<{
  errors?: ErrorsMap;
  onChange?: FormOnChange;
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

type ZodAnyOptional = zod.ZodOptional<any>;
function isZodOptional(schema: unknown): schema is ZodAnyOptional {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodOptional";
}

function isZodNumber(schema: unknown): schema is zod.ZodNumber {
  const typeName = getZodTypeNameFromSchema(schema);
  nn(typeName, "Invalid schema");

  return typeName === "ZodNumber";
}

function ComponentErrors({ errors }: { errors: zod.ZodIssue[] }) {
  return (
    <React.Fragment>
      {errors.map((error) => (
        <div style={{ color: "red" }} key={error.code}>
          {error.message}
        </div>
      ))}
    </React.Fragment>
  );
}

function ComponentDescription({ description }: { description?: string }) {
  if (!description) {
    return null;
  }

  return <span style={{ color: "#7a7a7a" }}>{description}</span>;
}

function ComponentErrorsOrDescription({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  const { errors } = useFormContext();
  const thisErrors = errors?.[name];

  if (thisErrors) {
    return <ComponentErrors errors={thisErrors} />;
  }

  return <ComponentDescription description={description} />;
}

interface IZodAnyComponentProps<Schema extends ZodFirstPartySchemaTypes> {
  schema: Schema;
  name?: string;
  description?: string;
  isRequired?: boolean;
}

interface IZodLeafComponentProps<Schema extends ZodFirstPartySchemaTypes>
  extends Pick<
      Required<IZodAnyComponentProps<Schema>>,
      "name" | "schema" | "isRequired"
    >,
    Pick<IZodAnyComponentProps<Schema>, "description"> {}

interface IZodStringComponentProps extends IZodLeafComponentProps<ZodString> {
  value?: string;
}
function ZodStringComponent({ name, schema, value }: IZodStringComponentProps) {
  const { onChange } = useFormContext();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange({
        value: event.target.value,
        path: componentNameDeserialize(name),
      });
    }
  }

  return (
    <label>
      {name}
      <input type="text" name={name} value={value} onChange={handleChange} />

      <ComponentErrorsOrDescription
        name={name}
        description={schema.description}
      />
    </label>
  );
}

function ZodEnumComponent({
  schema,
  name,
}: IZodLeafComponentProps<ZodAnyEnum>) {
  const { onChange } = useFormContext();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (onChange) {
      onChange({
        value: event.target.value,
        path: componentNameDeserialize(name),
      });
    }
  }

  return (
    <label>
      {name}
      <select name={name} onChange={handleChange}>
        {schema.options.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>

      <ComponentErrorsOrDescription
        name={name}
        description={schema.description}
      />
    </label>
  );
}

interface IZodArrayComponentProps extends IZodLeafComponentProps<ZodAnyArray> {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  value?: any[];
}
function ZodArrayComponent({
  schema,
  name,
  exactLength,
  minLength,
  value,
}: IZodArrayComponentProps) {
  const [items, setItems] = React.useState<ZodFirstPartySchemaTypes[]>(() => {
    return R.range(0, exactLength ?? minLength ?? 0).map(() => schema.element);
  });

  function renderElements() {
    if (value) {
      return value.map((item, index) => {
        const uniqueName = `${name}[${index}]`;
        return (
          <ZodAnyComponent
            key={uniqueName}
            name={uniqueName}
            schema={schema.element}
            value={item}
          />
        );
      });
    }

    return items.map((item, index) => {
      const uniqueName = `${name}[${index}]`;
      return (
        <ZodAnyComponent
          key={uniqueName}
          name={uniqueName}
          schema={item}
          value={value?.[index]}
        />
      );
    });
  }

  return (
    <div>
      {renderElements()}

      <button
        type="button"
        onClick={() => {
          setItems([...items, schema.element]);
        }}
      >
        Add
      </button>

      <ComponentErrorsOrDescription
        name={name}
        description={schema.description}
      />
    </div>
  );
}

interface IZodNumberComponentProps
  extends IZodLeafComponentProps<zod.ZodNumber> {
  value?: number;
}
function ZodNumberComponent({ name, schema, value }: IZodNumberComponentProps) {
  const { onChange } = useFormContext();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange({
        value: event.target.valueAsNumber,
        path: componentNameDeserialize(name),
      });
    }
  }

  return (
    <label>
      {name}
      <input type="number" name={name} value={value} onChange={handleChange} />

      <ComponentErrorsOrDescription
        name={name}
        description={schema.description}
      />
    </label>
  );
}

function ZodAnyComponent({
  schema,
  name,
  isRequired = true,
  value,
}: {
  schema: ZodFirstPartySchemaTypes;
  name?: string;
  isRequired?: boolean;
  value?: unknown;
}) {
  if (isZodObject(schema)) {
    // Don't create a div as the first child of the form
    return React.createElement(
      name ? "div" : React.Fragment,
      {},
      Object.entries(schema.shape).map(([thisName, thisSchema]) => {
        const childName = name ? [name, thisName].join(".") : thisName;
        const result = value
          ? (thisSchema as ZodFirstPartySchemaTypes).safeParse(value[thisName])
          : undefined;

        return (
          <ZodAnyComponent
            key={childName}
            name={childName}
            schema={thisSchema as ZodFirstPartySchemaTypes}
            value={result?.success ? result.data : undefined}
          />
        );
      })
    );
  }

  if (R.isNil(name)) {
    return null;
  }

  if (isZodString(schema)) {
    const result = value ? schema.safeParse(value) : undefined;
    return (
      <ZodStringComponent
        schema={schema}
        name={name}
        isRequired={isRequired}
        value={result?.success ? result.data : undefined}
      />
    );
  }

  if (isZodEnum(schema)) {
    return (
      <ZodEnumComponent schema={schema} name={name} isRequired={isRequired} />
    );
  }

  if (isZodArray(schema)) {
    const { minLength, maxLength, exactLength, description } = schema._def;
    const result = value ? schema.safeParse(value) : undefined;

    return (
      <ZodArrayComponent
        schema={schema}
        name={name}
        isRequired={isRequired}
        exactLength={exactLength?.value}
        maxLength={maxLength?.value}
        minLength={minLength?.value}
        description={description}
        value={result?.success ? result.data : undefined}
      />
    );
  }

  if (isZodNumber(schema)) {
    const result = value ? schema.safeParse(value) : undefined;
    return (
      <ZodNumberComponent
        schema={schema}
        name={name}
        isRequired={isRequired}
        value={result?.success ? result.data : undefined}
      />
    );
  }

  if (isZodOptional(schema)) {
    return (
      <ZodAnyComponent
        schema={schema._def.innerType}
        name={name}
        isRequired={false}
        value={value}
      />
    );
  }

  return null;
}

interface IFormProps<Schema extends AnyZodObject> {
  schema: Schema;
  onSubmit?: (value: zod.infer<Schema>) => void;
  value?: zod.input<Schema>;
  onChange?: FormOnChange;
}

export function Form<Schema extends AnyZodObject>({
  schema,
  onSubmit,
  value,
  onChange,
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
      <FormContextProvider value={{ errors, onChange }}>
        <ZodAnyComponent value={value} schema={schema} />
      </FormContextProvider>

      <button type="submit">Submit</button>
    </form>
  );
}
