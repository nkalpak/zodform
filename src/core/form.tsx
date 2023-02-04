import type { AnyZodObject, ZodFirstPartySchemaTypes, ZodString } from "zod";
import * as zod from "zod";
import { ZodEffects } from "zod";
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
import {
  IObjectDefaultProps,
  ObjectDefault,
} from "../components/default/object-default";
import { IsNonUndefinedUnion } from "../utils/type-utils";
import {
  IMultiChoiceDefaultProps,
  MultiChoiceDefault,
} from "../components/default/multi-choice-default";
import { PartialDeep } from "type-fest";
import { CondResult, resolveUiSchemaConds } from "./resolve-ui-schema-conds";

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
  conds: FormConds;
}>();

function isComponentVisible(name: string, conds: FormConds): boolean {
  return conds[name]?.cond ?? true;
}

function useComponent<UiProperties>(name: string): {
  errors: zod.ZodIssue[];
  uiSchema?: UiProperties;
  isVisible: boolean;
} {
  const { errors, conds } = useFormContext();

  return React.useMemo(() => {
    return {
      errors: errors?.[name] ?? [],
      isVisible: isComponentVisible(name, conds),
    };
  }, [conds, errors, name]);
}

/**
 * Extract the properties which should be available to any leaf component
 * (string, number, boolean, enum, etc.)
 * */
function getLeafPropsFromUiSchema(
  uiProps?: UiPropertiesBase<any, any>
): UiPropertiesLeaf<any, any> {
  return R.omit(uiProps ?? {}, ["component", "cond"]);
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
  const { errors, isVisible } =
    useComponent<UiPropertiesBase<string, any>>(name);

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

  if (!isVisible) {
    return null;
  }

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
      isRequired={isRequired}
      {...getLeafPropsFromUiSchema(uiSchema)}
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
  const { errors, isVisible } = useComponent<UiPropertiesEnum<any, any>>(name);

  function handleChange(value?: string) {
    onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  const Component = uiSchema?.component ?? components?.enum ?? EnumDefault;

  if (!isVisible) {
    return null;
  }

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
      {...getLeafPropsFromUiSchema(uiSchema)}
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
  const { errors, isVisible } =
    useComponent<UiPropertiesBase<number, any>>(name);

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

  if (!isVisible) {
    return null;
  }

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
      isRequired={isRequired}
      {...getLeafPropsFromUiSchema(uiSchema)}
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
  const { errors, isVisible } =
    useComponent<UiPropertiesBase<boolean, any>>(name);

  function handleChange(value: boolean) {
    onChange({
      op: "update",
      value,
      path: componentNameDeserialize(name),
    });
  }

  const Component =
    uiSchema?.component ?? components?.boolean ?? BooleanDefault;

  if (!isVisible) {
    return null;
  }

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={schema.description}
      errorMessage={R.first(errors)?.message}
      isRequired={isRequired}
      {...getLeafPropsFromUiSchema(uiSchema)}
    />
  );
}

interface IZodArrayComponentProps
  extends IZodLeafComponentProps<ZodAnyArray, any[]> {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  uiSchema?: UiPropertiesArray<any, any> | UiPropertiesMultiChoice<string, any>;
}
function ZodArrayComponent({
  schema,
  name,
  value = [],
  uiSchema,
}: IZodArrayComponentProps) {
  const { onChange, onArrayRemove, components } = useFormContext();
  const { errors, isVisible } = useComponent(name);

  if (!isVisible) {
    return null;
  }

  if (isZodEnum(schema.element)) {
    const uiProps = (uiSchema ?? {}) as UiPropertiesMultiChoice<string, any>;
    const Component =
      uiProps.component ?? components?.multiChoice ?? MultiChoiceDefault;

    return (
      <Component
        {...uiProps}
        label={uiProps.label}
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

  const uiProps = (uiSchema ?? {}) as UiPropertiesArray<any, any>;
  const Component = uiProps.component ?? components?.array ?? ArrayDefault;

  return (
    <Component
      title={uiProps.title}
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
  uiSchema?: UiPropertiesObject<any, any>;
  name?: string;
}) {
  const { isVisible } = useComponent(name ?? "");
  const { components } = useFormContext();

  if (!isVisible) {
    return null;
  }

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

type ResolveComponentProps<Value> = Value extends boolean
  ? IBooleanDefaultProps
  : Value extends Array<any>
  ? IArrayDefaultProps
  : IsNonUndefinedUnion<Value> extends true
  ? IMultiChoiceDefaultProps
  : Value extends string
  ? IStringDefaultProps
  : Value extends number
  ? INumberDefaultProps
  : Value extends object
  ? IObjectDefaultProps
  : never;

type UiPropertiesBase<Value, BaseSchema extends object> = {
  label?: React.ReactNode;
  component?: (props: ResolveComponentProps<Value | undefined>) => JSX.Element;
  autoFocus?: boolean;
  cond?: (data: PartialDeep<BaseSchema>) => boolean;
};

export type UiPropertiesLeaf<Value, BaseSchema extends object> = Omit<
  UiPropertiesBase<Value, BaseSchema>,
  "component"
>;

type UiPropertiesEnum<Schema extends string, BaseSchema extends object> = Omit<
  UiPropertiesBase<Schema, BaseSchema>,
  "component"
> & {
  component?: (props: IEnumDefaultProps) => JSX.Element;
  optionLabels?: Record<Schema, React.ReactNode>;
};

type UiPropertiesMultiChoice<
  Schema extends string,
  BaseSchema extends object
> = Pick<
  UiPropertiesEnum<Schema, BaseSchema>,
  "optionLabels" | "label" | "cond"
> & {
  component?: (props: IMultiChoiceDefaultProps) => JSX.Element;
};

type UiPropertiesObject<
  Schema extends object,
  BaseSchema extends object
> = UiSchemaInner<Schema, BaseSchema> & {
  ui?: {
    title?: React.ReactNode;
    component?: (props: IObjectDefaultProps) => JSX.Element;
    cond?: (data: PartialDeep<BaseSchema>) => boolean;
  };
};

/**
 * Arrays should allow for modifying the element type's ui schema too.
 * So, we do that through the `element` property.
 * */
type UiPropertiesArray<
  Schema extends Array<any>,
  BaseSchema extends object
> = (Schema extends Array<infer El extends object>
  ? {
      element?: Omit<UiPropertiesObject<El, BaseSchema>, "ui"> & {
        ui?: Omit<Required<UiPropertiesObject<El, BaseSchema>>["ui"], "cond">;
      };
    }
  : { element?: Omit<UiPropertiesBase<Schema[0], BaseSchema>, "cond"> }) & {
  title?: React.ReactNode;
  component?: (props: IArrayDefaultProps) => JSX.Element;
  cond?: (data: PartialDeep<BaseSchema>) => boolean;
};

type ResolveArrayUiProperties<
  Schema extends Array<string>,
  BaseSchema extends object
> = Schema extends Array<infer El extends string>
  ? IsNonUndefinedUnion<El> extends true
    ? UiPropertiesMultiChoice<El, BaseSchema>
    : UiPropertiesArray<Schema, BaseSchema>
  : UiPropertiesArray<Schema, BaseSchema>;

type ResolveUnionUiProperties<
  Schema,
  BaseSchema extends object
> = Schema extends string ? UiPropertiesEnum<Schema, BaseSchema> : never;

type UiSchemaInner<Schema extends object, BaseSchema extends object> = {
  // Boolean messes up the `IsNonUndefinedUnion` check, so we need to handle it first
  // TODO: Figure out how to handle this better
  [K in keyof Partial<Schema>]: Schema[K] extends boolean
    ? UiPropertiesBase<Schema[K], BaseSchema>
    : Schema[K] extends object
    ? Schema[K] extends Array<any>
      ? ResolveArrayUiProperties<Schema[K], BaseSchema>
      : UiPropertiesObject<Schema[K], BaseSchema>
    : IsNonUndefinedUnion<Schema[K]> extends true
    ? ResolveUnionUiProperties<Schema[K], BaseSchema>
    : UiPropertiesBase<Schema[K], BaseSchema>;
};

export type UiSchema<Schema extends SchemaType> = UiSchemaInner<
  zod.infer<Schema>,
  zod.infer<Schema>
>;

type SchemaType = AnyZodObject | ZodEffects<any>;
type FormChildren = (props: {
  errors: [keyof ErrorsMap, ErrorsMap[keyof ErrorsMap]][];
}) => JSX.Element;
type FormConds = Record<string, CondResult>;

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

function resolveNextFormConds(formData: any, uiSchema: UiSchema<any>) {
  const conds = resolveUiSchemaConds({
    uiSchema,
    formData,
  });

  return Object.fromEntries(
    conds.map((cond) => [componentNameSerialize(cond.path), cond])
  );
}

function getNextFormDataFromConds({
  formData,
  uiSchema,
}: {
  formData: Record<string, any>;
  uiSchema: UiSchema<any>;
}) {
  const conds = resolveUiSchemaConds({
    uiSchema,
    formData,
  });
  return produce(formData, (draft) => {
    conds.forEach(({ cond, path }) => {
      if (!cond) {
        unset(draft, path);
      }
    });
  });
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
  const [conds, setConds] = React.useState<FormConds>(() =>
    resolveNextFormConds(formData, uiSchema ?? {})
  );

  useUncontrolledToControlledWarning(value);

  const handleSubmit = React.useCallback(
    (value: typeof formData) => {
      const parsed = schema.safeParse(
        getNextFormDataFromConds({
          formData: value,
          uiSchema: uiSchema ?? {},
        })
      );

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
    [onSubmit, schema, uiSchema]
  );

  const handleChange: OnChange = React.useCallback(
    (event) => {
      const nextFormData = nextState(formData);
      setFormData(nextFormData);
      setConds(resolveNextFormConds(nextFormData, uiSchema ?? {}));

      function nextState(prev: Record<string, any>) {
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
    },
    [formData, uiSchema]
  );

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
        handleSubmit(formData);
      }}
    >
      {title}

      <FormContextProvider
        value={{
          conds,
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
