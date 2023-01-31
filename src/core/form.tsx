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
import { unset } from "../utils/unset";
import { ZodEffects } from "zod";
import {
  IObjectDefaultProps,
  ObjectDefault,
} from "../components/default/object-default";
import { IsNonUndefinedUnion } from "../utils/type-utils";
import {
  IMultiChoiceDefaultProps,
  MultiChoiceDefault,
} from "../components/default/multi-choice-default";

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
  components?: Required<IFormProps<any>>["components"];

  onChange: OnChange;
  onArrayRemove: (path: ComponentPath) => void;
}>();

function useComponent<UiProperties>(name: string): {
  errors: zod.ZodIssue[];
  uiSchema?: UiProperties;
} {
  const { errors } = useFormContext();

  return React.useMemo(() => {
    return {
      errors: errors?.[name] ?? [],
    };
  }, [errors, name]);
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
  uiSchema?: Record<string, any>;
}

interface IZodStringComponentProps
  extends IZodLeafComponentProps<ZodString, string> {}
function ZodStringComponent({
  name,
  schema,
  value,
  isRequired,
  uiSchema,
}: IZodStringComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors } = useComponent<UiPropertiesLeaf<string>>(name);

  function handleChange(value = "") {
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

  const Component = uiSchema?.component ?? components?.string ?? StringDefault;
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
  uiSchema,
}: IZodEnumComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors } = useComponent<UiPropertiesEnumInner<any>>(name);

  function handleChange(value?: string) {
    onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  function getEnumProps(
    uiSchema?: UiPropertiesEnumInner<any>
  ): UiPropertiesEnum<any> {
    return uiSchema ? R.pick(uiSchema, ["optionLabels"]) : {};
  }

  const Component = uiSchema?.component ?? components?.enum ?? EnumDefault;

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
      {...getEnumProps(uiSchema)}
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
  uiSchema,
}: IZodNumberComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors } = useComponent<UiPropertiesLeaf<number>>(name);

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

  const Component = uiSchema?.component ?? components?.number ?? NumberDefault;
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
  uiSchema,
}: IZodBooleanComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors } = useComponent<UiPropertiesLeaf<boolean>>(name);

  function handleChange(value: boolean) {
    onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  const Component =
    uiSchema?.component ?? components?.boolean ?? BooleanDefault;
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
  uiSchema?: UiPropertiesArray<any> | UiPropertiesMultiChoiceInner<string>;
}
function ZodArrayComponent({
  schema,
  name,
  value = [],
  uiSchema,
}: IZodArrayComponentProps) {
  const { onChange, onArrayRemove, components } = useFormContext();
  const { errors } = useComponent(name);

  if (isZodEnum(schema.element)) {
    const uiProps = (uiSchema ?? {}) as UiPropertiesMultiChoiceInner<string>;
    const Component =
      uiProps.component ?? components?.multiChoice ?? MultiChoiceDefault;

    return (
      <Component
        {...uiProps}
        label={uiProps.title}
        errorMessage={R.first(errors)?.message}
        onChange={(newValue) => {
          onChange({
            op: "update",
            path: componentNameDeserialize(name),
            value: newValue,
          });
        }}
        value={value}
        options={schema.element.options}
      />
    );
  }

  const uiProps = (uiSchema ?? {}) as UiPropertiesArray<any>;
  const Component = uiProps.component ?? components?.array ?? ArrayDefault;

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
            uiSchema={uiProps.element}
          />
        );
      })}
    </Component>
  );
}

function ZodObjectComponent({
  value,
  schema,
  name,
  uiSchema,
}: {
  value: any;
  schema: AnyZodObject;
  uiSchema?: ResolveObject<any>;
  name?: string;
}) {
  const { components } = useFormContext();

  // Don't create a div as the first child of the form
  const Component = name
    ? uiSchema?.ui?.component ?? components?.object ?? ObjectDefault
    : React.Fragment;

  return (
    <Component {...R.omit(uiSchema?.ui ?? {}, ["component"])}>
      {Object.entries(schema.shape).map(([thisName, thisSchema]) => {
        const childName = name ? [name, thisName].join(".") : thisName;

        return (
          <ZodAnyComponent
            key={childName}
            name={childName}
            schema={thisSchema as ZodFirstPartySchemaTypes}
            value={value ? value[thisName] : undefined}
            uiSchema={uiSchema ? uiSchema[thisName] : undefined}
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
  uiSchema,
}: {
  schema: ZodFirstPartySchemaTypes;
  name?: string;
  isRequired?: boolean;
  value?: any;
  uiSchema?: Record<string, any>;
}) {
  if (isZodObject(schema)) {
    return (
      <ZodObjectComponent
        uiSchema={uiSchema}
        value={value}
        schema={schema}
        name={name}
      />
    );
  }

  if (R.isNil(name)) {
    return null;
  }

  if (isZodString(schema)) {
    return (
      <ZodStringComponent
        uiSchema={uiSchema}
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
        uiSchema={uiSchema}
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
        uiSchema={uiSchema}
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
        uiSchema={uiSchema}
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
        uiSchema={uiSchema}
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
        uiSchema={uiSchema}
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
        uiSchema={uiSchema}
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
  component?: (props: IComponentProps<Value | undefined>) => JSX.Element;
  autoFocus?: boolean;
};

type UiPropertiesArray<Schema extends Array<any>> = (Schema extends Array<
  infer El extends object
>
  ? {
      element?: ResolveObject<El>;
    }
  : { element?: UiPropertiesLeaf<Schema[0]> }) & {
  title?: React.ReactNode;
  component?: (props: IArrayDefaultProps) => JSX.Element;
};

type UiPropertiesMultiChoiceInner<Schema extends string> = Pick<
  UiPropertiesEnum<Schema>,
  "optionLabels"
> & {
  title?: React.ReactNode;
  component?: (props: IMultiChoiceDefaultProps) => JSX.Element;
};

export type UiPropertiesMultiChoice<Schema extends string> = Omit<
  UiPropertiesMultiChoiceInner<Schema>,
  "component"
>;

type UiPropertiesObject = {
  ui?: {
    title?: React.ReactNode;
    component?: (props: IObjectDefaultProps) => JSX.Element;
  };
};

// TODO: Implement this kind of type for all the other types (replace leaf stuff)
type UiPropertiesEnumInner<Schema extends string> = {
  component?: (props: IEnumDefaultProps) => JSX.Element;
  label?: React.ReactNode;
  optionLabels?: Record<Schema, React.ReactNode>;
};

export type UiPropertiesEnum<Schema extends string> = Omit<
  UiPropertiesEnumInner<Schema>,
  "component" | "label"
>;

type ResolveUnion<Schema> = Schema extends string
  ? UiPropertiesEnumInner<Schema>
  : never;

type ResolveArray<Schema extends Array<string>> = Schema extends Array<
  infer El extends string
>
  ? IsNonUndefinedUnion<El> extends true
    ? UiPropertiesMultiChoiceInner<El>
    : UiPropertiesArray<Schema>
  : UiPropertiesArray<Schema>;

type ResolveObject<Schema extends object> = UiPropertiesObject &
  UiSchemaInner<Schema>;

type UiSchemaInner<Schema extends object> = {
  // Boolean messes up the `IsNonUndefinedUnion` check, so we need to handle it separately
  // TODO: Figure out how to handle this better
  [K in keyof Partial<Schema>]: Schema[K] extends boolean
    ? UiPropertiesLeaf<Schema[K]>
    : Schema[K] extends object
    ? Schema[K] extends Array<any>
      ? ResolveArray<Schema[K]>
      : ResolveObject<Schema[K]>
    : IsNonUndefinedUnion<Schema[K]> extends true
    ? ResolveUnion<Schema[K]>
    : UiPropertiesLeaf<Schema[K]>;
};

export type UiSchema<Schema extends SchemaType> = UiSchemaInner<
  zod.infer<Schema>
>;

type SchemaType = AnyZodObject | ZodEffects<any>;
type FormChildren = (props: {
  errors: [keyof ErrorsMap, ErrorsMap[keyof ErrorsMap]][];
}) => JSX.Element;

interface IFormProps<Schema extends SchemaType> {
  schema: Schema;
  uiSchema?: UiSchema<Schema>;
  onSubmit?: (value: zod.infer<Schema>) => void;
  value?: zod.infer<Schema>;
  defaultValue?: zod.infer<Schema>;
  components?: {
    string?: (props: IStringDefaultProps) => JSX.Element;
    number?: (props: INumberDefaultProps) => JSX.Element;
    enum?: (props: IEnumDefaultProps) => JSX.Element;
    boolean?: (props: IBooleanDefaultProps) => JSX.Element;
    object?: (props: IObjectDefaultProps) => JSX.Element;
    array?: (props: IArrayDefaultProps) => JSX.Element;
    multiChoice?: (props: IMultiChoiceDefaultProps) => JSX.Element;
  };
  title?: React.ReactNode;
  children?: FormChildren;
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

  components,
  title,

  children,
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

  const validate = React.useCallback(
    (value: typeof formData) => {
      const parsed = schema.safeParse(value);

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
    },
    [onSubmit, schema]
  );

  const handleChange: OnChange = React.useCallback((event) => {
    function nextState(prev: typeof formData) {
      return produce(prev, (draft) => {
        if (event.op === "update") {
          set(draft, event.path, event.value);
        } else {
          unset(draft, event.path, {
            arrayBehavior: "setToUndefined",
          });
        }
      });
    }
    setFormData(nextState);
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

  return (
    <form
      style={{
        display: "grid",
        gap: 32,
      }}
      onSubmit={(event) => {
        event.preventDefault();
        validate(formData);
      }}
    >
      {title}

      <FormContextProvider
        value={{
          errors,
          onChange: handleChange,
          components,
          onArrayRemove,
        }}
      >
        <ZodAnyComponent
          uiSchema={uiSchema}
          value={value ?? formData}
          schema={objectSchema}
        />
      </FormContextProvider>

      {children ? (
        children({ errors: Object.entries(errors ?? {}) })
      ) : (
        <button type="submit">Submit</button>
      )}
    </form>
  );
}
