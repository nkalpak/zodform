import type { AnyZodObject, ZodFirstPartySchemaTypes, ZodString } from "zod";
import * as zod from "zod";
import * as R from "remeda";
import React from "react";
import { createContext } from "../utils/create-context";
import "../App.css";
import {
  componentNameDeserialize,
  componentNameSerialize,
} from "../utils/component-name-deserialize";
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
import { IComponentProps } from "../components/types";
import {
  ArrayDefault,
  IArrayDefaultProps,
} from "../components/default/array-default";
import {
  BooleanDefault,
  IBooleanDefaultProps,
} from "../components/default/boolean-default";
import set from "lodash.set";
import produce from "immer";
import {
  isZodArray,
  isZodBoolean,
  isZodDefault,
  isZodEffects,
  isZodEnum,
  isZodNumber,
  isZodObject,
  isZodOptional,
  isZodString,
  ZodAnyArray,
  ZodAnyEnum,
} from "./schema-type-resolvers";
import { formDefaultValueFromSchema } from "./form-default-value-from-schema";
import { useUncontrolledToControlledWarning } from "../utils/use-uncontrolled-to-controlled-warning";
import get from "lodash.get";
import { unset } from "../utils/unset";
import { ZodEffects } from "zod";

type ComponentName = string;
type ErrorsMap = Record<ComponentName, zod.ZodIssue[]>;
export type ComponentPath = (string | number)[];

type ChangeOp = "update" | "remove";
type OnChange = (
  data:
    | {
        value: any;
        path: ComponentPath;
        op: Extract<ChangeOp, "update">;
      }
    | {
        path: ComponentPath;
        op: Extract<ChangeOp, "remove">;
      }
) => void;

const [useFormContext, FormContextProvider] = createContext<{
  errors?: ErrorsMap;
  uiSchema?: UiSchema<any>;
  leafs?: Required<IFormProps<any>>["leafs"];

  onChange: OnChange;
  onArrayRemove: (path: ComponentPath) => void;
}>();

function useComponent<UiProperties>(name: string): {
  errors: zod.ZodIssue[];
  uiSchema?: UiProperties;
} {
  const { errors, uiSchema } = useFormContext();

  return React.useMemo(() => {
    const thisUiSchema = uiSchema ? get(uiSchema, name) : undefined;

    return {
      errors: errors?.[name] ?? [],
      uiSchema: thisUiSchema
        ? (("ui" in thisUiSchema
            ? thisUiSchema.ui
            : thisUiSchema) as UiProperties)
        : undefined,
    };
  }, [errors, uiSchema]);
}

interface IZodLeafComponentProps<
  Schema extends ZodFirstPartySchemaTypes,
  Value
> {
  schema: Schema;
  name: string;
  description?: string;
  isRequired: boolean;
  value?: Value;
}

interface IZodStringComponentProps
  extends IZodLeafComponentProps<ZodString, string> {}
function ZodStringComponent({
  name,
  schema,
  value,
  isRequired,
}: IZodStringComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<string>>(name);

  function handleChange(value: string = "") {
    const isEmpty = value === "";

    if (isEmpty) {
      return onChange({
        op: "remove",
        path: componentNameDeserialize(name),
      });
    }

    return onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  const Component = uiSchema?.component ?? leafs?.string ?? StringDefault;
  const uiProps = uiSchema ? R.pick(uiSchema, ["autoFocus"]) : {};

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
      isRequired={isRequired}
      {...uiProps}
    />
  );
}

interface IZodEnumComponentProps
  extends IZodLeafComponentProps<ZodAnyEnum, string> {}
function ZodEnumComponent({
  schema,
  name,
  value = "",
  isRequired,
}: IZodEnumComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<string>>(name);

  function handleChange(value?: string) {
    onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  const Component = uiSchema?.component ?? leafs?.enum ?? EnumDefault;
  const uiProps = uiSchema ? R.pick(uiSchema, ["autoFocus"]) : {};

  return (
    <Component
      options={schema.options}
      errorMessage={R.first(errors)?.message}
      label={uiSchema?.label ?? name}
      name={name}
      description={schema.description}
      onChange={handleChange}
      value={value}
      isRequired={isRequired}
      {...uiProps}
    />
  );
}

interface IZodNumberComponentProps
  extends IZodLeafComponentProps<zod.ZodNumber, number> {}
function ZodNumberComponent({
  name,
  schema,
  value,
  isRequired,
}: IZodNumberComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<number>>(name);

  function handleChange(value?: number) {
    const isEmpty = R.isNil(value) || Number.isNaN(value);

    if (isEmpty) {
      return onChange({
        op: "remove",
        path: componentNameDeserialize(name),
      });
    }

    return onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  const Component = uiSchema?.component ?? leafs?.number ?? NumberDefault;
  const uiProps = uiSchema ? R.pick(uiSchema, ["autoFocus"]) : {};

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
      isRequired={isRequired}
      {...uiProps}
    />
  );
}
interface IZodBooleanComponentProps
  extends IZodLeafComponentProps<zod.ZodBoolean, boolean> {}
function ZodBooleanComponent({
  value,
  isRequired,
  schema,
  name,
}: IZodBooleanComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<boolean>>(name);

  function handleChange(value: boolean) {
    onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  const Component = uiSchema?.component ?? leafs?.boolean ?? BooleanDefault;
  const uiProps = uiSchema ? R.pick(uiSchema, ["autoFocus"]) : {};

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
      isRequired={isRequired}
      {...uiProps}
    />
  );
}

interface IZodArrayComponentProps
  extends IZodLeafComponentProps<ZodAnyArray, any[]> {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
}
function ZodArrayComponent({
  schema,
  name,
  value = [],
}: IZodArrayComponentProps) {
  const { onChange, onArrayRemove } = useFormContext();
  const { uiSchema } = useComponent<UiPropertiesArray>(name);

  const Component = uiSchema?.component ?? ArrayDefault;

  return (
    <Component
      title={uiSchema?.title}
      onRemove={(index) => {
        onArrayRemove(componentNameDeserialize(`${name}[${index}]`));
      }}
      onAdd={() => {
        onChange({
          op: "update",
          path: componentNameDeserialize(`${name}[${value.length}]`),
          value: formDefaultValueFromSchema(schema.element),
        });
      }}
    >
      {value.map((item, index) => {
        const uniqueName = `${name}[${index}]`;
        return (
          <ZodAnyComponent
            key={uniqueName}
            name={uniqueName}
            schema={schema.element}
            value={item}
          />
        );
      })}
    </Component>
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
  value?: any;
}) {
  if (isZodObject(schema)) {
    // Don't create a div as the first child of the form
    return React.createElement(
      name ? "div" : React.Fragment,
      {},
      Object.entries(schema.shape).map(([thisName, thisSchema]) => {
        const childName = name ? [name, thisName].join(".") : thisName;

        return (
          <ZodAnyComponent
            key={childName}
            name={childName}
            schema={thisSchema as ZodFirstPartySchemaTypes}
            value={value ? value?.[thisName] : undefined}
          />
        );
      })
    );
  }

  if (R.isNil(name)) {
    return null;
  }

  if (isZodString(schema)) {
    return (
      <ZodStringComponent
        schema={schema}
        name={name}
        isRequired={isRequired}
        value={value}
      />
    );
  }

  if (isZodEnum(schema)) {
    return (
      <ZodEnumComponent
        value={value}
        schema={schema}
        name={name}
        isRequired={isRequired}
      />
    );
  }

  if (isZodBoolean(schema)) {
    return (
      <ZodBooleanComponent
        schema={schema}
        name={name}
        isRequired={isRequired}
        value={value}
      />
    );
  }

  if (isZodArray(schema)) {
    const { minLength, maxLength, exactLength, description } = schema._def;

    return (
      <ZodArrayComponent
        schema={schema}
        name={name}
        isRequired={isRequired}
        exactLength={exactLength?.value}
        maxLength={maxLength?.value}
        minLength={minLength?.value}
        description={description}
        value={value}
      />
    );
  }

  if (isZodNumber(schema)) {
    return (
      <ZodNumberComponent
        schema={schema}
        name={name}
        isRequired={isRequired}
        value={value}
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

  if (isZodDefault(schema)) {
    return (
      <ZodAnyComponent
        schema={schema._def.innerType}
        name={name}
        isRequired={isRequired}
        value={value}
      />
    );
  }

  return null;
}

type UiPropertiesLeaf<Value> = {
  label?: React.ReactNode;
  component?: (props: IComponentProps<Value>) => JSX.Element;
  autoFocus?: boolean;
};

type UiPropertiesArray = {
  title?: React.ReactNode;
  component?: (props: IArrayDefaultProps) => JSX.Element;
};

type UiPropertiesObject = {
  ui?: {
    title?: React.ReactNode;
  };
};

type UiSchema<Schema extends object> = {
  [K in keyof Partial<Schema>]: Schema[K] extends object
    ? Schema[K] extends Array<any>
      ? UiPropertiesArray
      : UiPropertiesObject & UiSchema<Schema[K]>
    : UiPropertiesLeaf<Schema[K]>;
};

type SchemaType = AnyZodObject | ZodEffects<any>;
interface IFormProps<Schema extends SchemaType> {
  schema: Schema;
  uiSchema?: UiSchema<zod.infer<Schema>>;
  onSubmit?: (value: zod.infer<Schema>) => void;
  value?: zod.infer<Schema>;
  defaultValue?: zod.infer<Schema>;
  leafs?: {
    string?: (props: IStringDefaultProps) => JSX.Element;
    number?: (props: INumberDefaultProps) => JSX.Element;
    enum?: (props: IEnumDefaultProps) => JSX.Element;
    boolean?: (props: IBooleanDefaultProps) => JSX.Element;
  };
  title?: React.ReactNode;
}

/**
 * Zod may wrap the schema in an effects
 * object (when using refine, for example)
 * so we need to resolve the schema to the actual
 * object schema from which we can generate the form
 * */
function resolveObjectSchema(schema: SchemaType): AnyZodObject {
  if (isZodObject(schema)) {
    return schema;
  }

  if (isZodEffects(schema)) {
    return resolveObjectSchema(schema._def.schema);
  }

  throw new Error(`Schema must be an object, got ${schema}`);
}

export function Form<Schema extends SchemaType>({
  schema,
  uiSchema,

  onSubmit,
  value,
  defaultValue,

  leafs,
  title,
}: IFormProps<Schema>) {
  const objectSchema = React.useMemo(
    () => resolveObjectSchema(schema),
    [schema]
  );
  const [errors, setErrors] = React.useState<ErrorsMap>();
  const [formData, setFormData] = React.useState(
    defaultValue ?? formDefaultValueFromSchema(objectSchema)
  );

  useUncontrolledToControlledWarning(value);

  const handleChange: OnChange = React.useCallback((event) => {
    setFormData((prev) =>
      produce(prev, (draft) => {
        if (event.op === "update") {
          set(draft, event.path, event.value);
        } else {
          unset(draft, event.path, {
            arrayBehavior: "setToUndefined",
          });
        }
      })
    );
  }, []);

  const onArrayRemove = React.useCallback((path: ComponentPath) => {
    setFormData((prev) =>
      produce(prev, (draft) => {
        unset(draft, path, {
          arrayBehavior: "delete",
        });
      })
    );
  }, []);

  console.log(formData);

  return (
    <form
      style={{
        display: "grid",
        gap: 32,
      }}
      onSubmit={(event) => {
        event.preventDefault();

        const parsed = schema.safeParse(formData);

        if (parsed.success) {
          setErrors(undefined);
          onSubmit?.(parsed.data);
        } else {
          console.error(parsed.error);
          setErrors(() =>
            R.groupBy(parsed.error.errors, (item) =>
              componentNameSerialize(item.path)
            )
          );
        }
      }}
    >
      {title}

      <FormContextProvider
        value={{
          errors,
          onChange: handleChange,
          uiSchema,
          leafs,
          onArrayRemove,
        }}
      >
        <ZodAnyComponent value={value ?? formData} schema={objectSchema} />
      </FormContextProvider>

      <button type="submit">Submit</button>
    </form>
  );
}
