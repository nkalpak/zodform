import type { AnyZodObject, ZodFirstPartySchemaTypes, ZodString } from "zod";
import * as zod from "zod";
import * as R from "remeda";
import { parseObjectFromFlattenedEntries } from "../utils/parse-object-from-flattened-names";
import { nn } from "../utils/invariant";
import React from "react";
import { createContext } from "../utils/create-context";
import "../App.css";
import { componentNameDeserialize } from "../utils/component-name-deserialize";
import { get } from "../utils/get";
import {
  IStringDefaultProps,
  StringDefault,
} from "../components/default/string-default";
import {
  EnumDefault,
  IEnumDefaultProps,
} from "../components/default/enum-default";
import {
  INumberDefaultProps,
  NumberDefault,
} from "../components/default/number-default";

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
  uiSchema?: UiSchema<any>;
  leafs?: Required<IFormProps<any>>["leafs"];
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

function useComponent(name: string) {
  const { errors, uiSchema } = useFormContext();

  return React.useMemo(
    () => ({
      errors: errors?.[name] ?? [],
      uiSchema: uiSchema ? get(uiSchema, name) : undefined,
    }),
    [errors, uiSchema]
  );
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
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent(name);

  function handleChange(value: string) {
    if (onChange) {
      onChange({
        value,
        path: componentNameDeserialize(name),
      });
    }
  }

  const Component = uiSchema?.ui_component ?? leafs?.string ?? StringDefault;

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.ui_label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
    />
  );
}

interface IZodEnumComponentProps extends IZodLeafComponentProps<ZodAnyEnum> {
  value?: string;
}
function ZodEnumComponent({ schema, name, value }: IZodEnumComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent(name);

  function handleChange(value: string) {
    if (onChange) {
      onChange({
        value,
        path: componentNameDeserialize(name),
      });
    }
  }

  const Component = uiSchema?.ui_component ?? leafs?.enum ?? EnumDefault;
  return (
    <Component
      options={schema.options}
      errorMessage={R.first(errors)?.message}
      label={uiSchema?.ui_label ?? name}
      name={name}
      description={schema.description}
      onChange={handleChange}
      value={value}
    />
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
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent(name);

  function handleChange(value: number) {
    if (onChange) {
      onChange({
        value,
        path: componentNameDeserialize(name),
      });
    }
  }

  // TODO: Add custom component
  const Component = leafs?.number ?? NumberDefault;
  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.ui_label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
    />
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
    const result = value ? schema.safeParse(value) : undefined;
    return (
      <ZodEnumComponent
        value={result?.success ? result.data : undefined}
        schema={schema}
        name={name}
        isRequired={isRequired}
      />
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

interface ICustomComponentProps<Value> {
  value?: Value;
  name: string;
  onChange: (value: Value) => void;
}

type UiProperties<Value> = {
  ui_label?: React.ReactNode;
  ui_component?: (props: ICustomComponentProps<Value>) => JSX.Element;
};

type UiSchema<Schema extends object> = {
  [K in keyof Partial<Schema>]: Schema[K] extends object
    ? Schema[K] extends Array<any>
      ? UiProperties<Schema[K]>
      : UiProperties<Schema[K]> & UiSchema<Schema[K]>
    : UiProperties<Schema[K]>;
};

interface IFormProps<Schema extends AnyZodObject> {
  schema: Schema;
  uiSchema?: UiSchema<zod.infer<Schema>>;
  onSubmit?: (value: zod.infer<Schema>) => void;
  value?: zod.input<Schema>;
  onChange?: FormOnChange;
  leafs?: {
    string?: (props: IStringDefaultProps) => JSX.Element;
    number?: (props: INumberDefaultProps) => JSX.Element;
    enum?: (props: IEnumDefaultProps) => JSX.Element;
  };
}

export function Form<Schema extends AnyZodObject>({
  schema,
  uiSchema,

  onSubmit,
  value,
  onChange,

  leafs,
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
            // TODO: Serialize correctly for arrays
            R.groupBy(parsed.error.errors, (item) => item.path.join("."))
          );
        }
      }}
    >
      <FormContextProvider value={{ errors, onChange, uiSchema, leafs }}>
        <ZodAnyComponent value={value} schema={schema} />
      </FormContextProvider>

      <button type="submit">Submit</button>
    </form>
  );
}
