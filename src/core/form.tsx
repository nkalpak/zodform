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
  isZodEnum,
  isZodNumber,
  isZodObject,
  isZodOptional,
  isZodString,
  ZodAnyArray,
  ZodAnyEnum,
} from "./schema-type-resolvers";
import { formDefaultValueFromSchema } from "./form-default-value-from-schema";

type ComponentName = string;
type ErrorsMap = Record<ComponentName, zod.ZodIssue[]>;
type ComponentPath = (string | number)[];
type FormOnChange = (data: {
  value?: string | number | boolean;
  path: ComponentPath;
}) => void;

const [useFormContext, FormContextProvider] = createContext<{
  errors?: ErrorsMap;
  onChange?: FormOnChange;
  uiSchema?: UiSchema<any>;
  leafs?: Required<IFormProps<any>>["leafs"];
}>();

function useComponent<UiProperties>(name: string): {
  errors: zod.ZodIssue[];
  uiSchema?: UiProperties;
} {
  const { errors, uiSchema } = useFormContext();

  return React.useMemo(
    () => ({
      errors: errors?.[name] ?? [],
      uiSchema: uiSchema ? get(uiSchema, name)?.ui : undefined,
    }),
    [errors, uiSchema]
  );
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
  defaultValue?: Value;
}

interface IZodStringComponentProps
  extends IZodLeafComponentProps<ZodString, string> {}
function ZodStringComponent({
  name,
  schema,
  value = "",
  isRequired,
  defaultValue,
}: IZodStringComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<string>>(name);

  function handleChange(value: string) {
    if (onChange) {
      onChange({
        value,
        path: componentNameDeserialize(name),
      });
    }
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
      defaultValue={defaultValue}
      {...uiProps}
    />
  );
}

interface IZodEnumComponentProps
  extends IZodLeafComponentProps<ZodAnyEnum, string> {}
function ZodEnumComponent({
  schema,
  name,
  value,
  isRequired,
  defaultValue,
}: IZodEnumComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<string>>(name);

  function handleChange(value?: string) {
    if (onChange) {
      onChange({
        value,
        path: componentNameDeserialize(name),
      });
    }
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
      defaultValue={defaultValue}
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
  defaultValue,
}: IZodNumberComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<number>>(name);

  function handleChange(value: number | undefined) {
    if (onChange) {
      onChange({
        value,
        path: componentNameDeserialize(name),
      });
    }
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
      defaultValue={defaultValue}
      {...uiProps}
    />
  );
}
interface IZodBooleanComponentProps
  extends IZodLeafComponentProps<zod.ZodBoolean, boolean> {}
function ZodBooleanComponent({
  defaultValue,
  value,
  isRequired,
  schema,
  name,
}: IZodBooleanComponentProps) {
  const { onChange, leafs } = useFormContext();
  const { errors, uiSchema } = useComponent<UiPropertiesLeaf<boolean>>(name);

  function handleChange(value: boolean) {
    if (onChange) {
      onChange({
        value,
        path: componentNameDeserialize(name),
      });
    }
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
      defaultValue={defaultValue}
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
  exactLength,
  minLength,
  value,
}: IZodArrayComponentProps) {
  const { uiSchema } = useComponent<UiPropertiesArray["ui"]>(name);
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

  const Component = uiSchema?.component ?? ArrayDefault;

  return (
    <Component
      title={uiSchema?.title}
      onRemove={(index) => {
        setItems((items) => items.filter((item, i) => index !== i));
      }}
      onAdd={() => {
        setItems([...items, schema.element]);
      }}
    >
      {renderElements()}
    </Component>
  );
}

function ZodAnyComponent({
  schema,
  name,
  isRequired = true,
  value,
  defaultValue,
}: {
  schema: ZodFirstPartySchemaTypes;
  name?: string;
  isRequired?: boolean;
  value?: any;
  defaultValue?: any;
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
            defaultValue={defaultValue}
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
        defaultValue={defaultValue}
      />
    );
  }

  if (isZodEnum(schema)) {
    return (
      <ZodEnumComponent
        value={value}
        defaultValue={defaultValue}
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
        defaultValue={defaultValue}
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
        defaultValue={defaultValue}
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
        defaultValue={defaultValue}
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
        defaultValue={defaultValue}
      />
    );
  }

  if (isZodDefault(schema)) {
    return (
      <ZodAnyComponent
        schema={schema._def.innerType}
        name={name}
        isRequired={isRequired}
        defaultValue={schema._def.defaultValue()}
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

type UiPropertiesSchema<Value> = {
  ui?: UiPropertiesLeaf<Value>;
};

type UiPropertiesArray = {
  ui?: {
    title?: React.ReactNode;
    component?: (props: IArrayDefaultProps) => JSX.Element;
  };
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
    : UiPropertiesSchema<Schema[K]>;
};

interface IFormProps<Schema extends AnyZodObject> {
  schema: Schema;
  uiSchema?: UiSchema<zod.infer<Schema>>;
  onSubmit?: (value: zod.infer<Schema>) => void;
  value?: zod.infer<Schema>;
  defaultValue?: zod.infer<Schema>;
  onChange?: FormOnChange;
  leafs?: {
    string?: (props: IStringDefaultProps) => JSX.Element;
    number?: (props: INumberDefaultProps) => JSX.Element;
    enum?: (props: IEnumDefaultProps) => JSX.Element;
    boolean?: (props: IBooleanDefaultProps) => JSX.Element;
  };
  title?: React.ReactNode;
}

export function Form<Schema extends AnyZodObject>({
  schema,
  uiSchema,

  onSubmit,
  value,
  defaultValue,
  onChange,

  leafs,
  title,
}: IFormProps<Schema>) {
  const [errors, setErrors] = React.useState<ErrorsMap>();
  const [formData, setFormData] = React.useState(
    defaultValue ?? formDefaultValueFromSchema(schema)
  );
  const [firstValue] = React.useState(value);

  if (R.isNil(firstValue) && R.isDefined(value)) {
    console.warn("Component changed from controlled to uncontrolled");
  }

  const handleChange: FormOnChange = React.useCallback(({ value, path }) => {
    setFormData((prev) =>
      produce(prev, (draft) => {
        set(draft, componentNameSerialize(path), value);
      })
    );

    onChange?.({ value, path });
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
            // TODO: Serialize correctly for arrays
            R.groupBy(parsed.error.errors, (item) => item.path.join("."))
          );
        }
      }}
    >
      {title}

      <FormContextProvider
        value={{ errors, onChange: handleChange, uiSchema, leafs }}
      >
        <ZodAnyComponent value={value ?? formData} schema={schema} />
      </FormContextProvider>

      <button type="submit">Submit</button>
    </form>
  );
}
