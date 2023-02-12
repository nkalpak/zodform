import type { AnyZodObject, ZodEffects, ZodFirstPartySchemaTypes, ZodString } from 'zod';
import * as zod from 'zod';
import * as R from 'remeda';
import React from 'react';
import { componentNameDeserialize, componentNameSerialize } from './component-name-deserialize';
import { IStringDefaultProps, StringDefault } from '../components/default/string-default';
import { EnumDefault, IEnumDefaultProps } from '../components/default/enum-default';
import { INumberDefaultProps, NumberDefault } from '../components/default/number-default';
import { ArrayDefault, IArrayDefaultProps } from '../components/default/array-default';
import { BooleanDefault, IBooleanDefaultProps } from '../components/default/boolean-default';
import set from 'lodash.set';
import produce from 'immer';
import {
  isZodArray,
  isZodBoolean,
  isZodDate,
  isZodDefault,
  isZodEffects,
  isZodEnum,
  isZodNumber,
  isZodObject,
  isZodOptional,
  isZodString,
  ZodAnyArray,
  ZodAnyEnum
} from './schema-type-resolvers';
import { formDefaultValueFromSchema } from './form-default-value-from-schema';
import { useUncontrolledToControlledWarning } from '../utils/use-uncontrolled-to-controlled-warning';
import { unset } from '../utils/unset';
import { IObjectDefaultProps, ObjectDefault } from '../components/default/object-default';
import { IsNonUndefinedUnion, IsUnion, RequiredDeep } from '../utils/type-utils';
import { IMultiChoiceDefaultProps, MultiChoiceDefault } from '../components/default/multi-choice-default';
import { PartialDeep } from 'type-fest';
import { CondResult, resolveUiSchemaConds } from './resolve-ui-schema-conds';
import { createContext } from '../utils/create-context';
import { DateDefault, IDateDefaultProps } from '../components/default/date-default';
import { mergeZodOuterInnerType } from './merge-zod-outer-inner-type';

function zodSchemaDescription(schema: ZodFirstPartySchemaTypes) {
  return schema._def.description;
}

type ComponentName = string;
type ErrorsMap = Record<ComponentName, zod.ZodIssue[]>;
export type ComponentPath = (string | number)[];

type ChangeOp = 'update' | 'remove';
type ChangePayload =
  | {
      value: any;
      path: ComponentPath;
      op: Extract<ChangeOp, 'update'>;
    }
  | {
      path: ComponentPath;
      op: Extract<ChangeOp, 'remove'>;
    };
type OnChange = (data: ChangePayload) => void;

const [useFormContext, FormContextProvider] = createContext<{
  errors?: ErrorsMap;
  components?: Required<IFormProps<any>>['components'];

  onChange: OnChange;
  onArrayRemove: (path: ComponentPath) => void;
  conds: FormConds;
}>();

function isComponentVisible(name: string, conds: FormConds): boolean {
  return conds[name]?.cond ?? true;
}

function useComponent(name: string): {
  errors: zod.ZodIssue[];
  isVisible: boolean;
} {
  const { errors, conds } = useFormContext();

  return React.useMemo(() => {
    return {
      errors: errors?.[name] ?? [],
      isVisible: isComponentVisible(name, conds)
    };
  }, [conds, errors, name]);
}

/**
 * Extract the properties which should be available to any leaf component
 * (string, number, boolean, enum, etc.)
 * */
function getLeafPropsFromUiSchema(
  // We don't care about the type of "component", since we'll omit it anyways
  uiProps?: Omit<UiPropertiesBase<any, any>, 'component'> & { component?: any }
): UiPropertiesLeaf<any> {
  return R.omit(uiProps ?? {}, ['component', 'cond']);
}

interface IZodLeafComponentProps<Schema extends ZodFirstPartySchemaTypes, Value> {
  schema: Schema;
  name: string;
  description?: React.ReactNode;
  isRequired: boolean;
  value?: Value;
}

interface IZodInnerComponentProps {
  onChange: OnChange;
  components: IFormProps<any>['components'];
  errorMessage?: string;
}

interface IZodStringComponentProps extends IZodLeafComponentProps<ZodString, string> {
  uiSchema?: UiPropertiesBase<string, any>;
}

const ZodStringComponentInner = React.memo(function ZodStringComponentInner({
  name,
  schema,
  value,
  isRequired,
  uiSchema,

  onChange,
  components,
  errorMessage
}: IZodStringComponentProps & IZodInnerComponentProps) {
  const handleChange = React.useCallback(
    function handleChange(value = '') {
      const isEmpty = value === '';

      if (isEmpty) {
        return onChange({
          op: 'remove',
          path: componentNameDeserialize(name)
        });
      }

      return onChange({
        op: 'update',
        value,
        path: componentNameDeserialize(name)
      });
    },
    [name, onChange]
  );

  const Component = uiSchema?.component ?? components?.string ?? StringDefault;

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={zodSchemaDescription(schema)}
      errorMessage={errorMessage}
      isRequired={isRequired}
      {...getLeafPropsFromUiSchema(uiSchema)}
    />
  );
});

function ZodStringComponent(props: IZodStringComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors, isVisible } = useComponent(props.name);

  if (!isVisible) {
    return null;
  }

  return (
    <ZodStringComponentInner
      {...props}
      errorMessage={R.first(errors)?.message}
      onChange={onChange}
      components={components}
    />
  );
}

interface IZodEnumComponentProps extends IZodLeafComponentProps<ZodAnyEnum, string> {
  uiSchema?: UiPropertiesEnum<any, any>;
}

const ZodEnumComponentInner = React.memo(function ZodEnumComponentInner({
  schema,
  name,
  value = '',
  isRequired,
  uiSchema,

  components,
  onChange,
  errorMessage
}: IZodEnumComponentProps & IZodInnerComponentProps) {
  const handleChange = React.useCallback(
    function handleChange(value = '') {
      const isEmpty = value === '';

      if (isEmpty) {
        return onChange({
          op: 'remove',
          path: componentNameDeserialize(name)
        });
      }

      return onChange({
        op: 'update',
        value,
        path: componentNameDeserialize(name)
      });
    },
    [name, onChange]
  );

  const Component = uiSchema?.component ?? components?.enum ?? EnumDefault;

  return (
    <Component
      options={schema._def.values}
      errorMessage={errorMessage}
      label={uiSchema?.label ?? name}
      name={name}
      description={zodSchemaDescription(schema)}
      onChange={handleChange}
      value={value}
      isRequired={isRequired}
      {...getLeafPropsFromUiSchema(uiSchema)}
    />
  );
});

function ZodEnumComponent(props: IZodEnumComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors, isVisible } = useComponent(props.name);

  if (!isVisible) {
    return null;
  }

  return (
    <ZodEnumComponentInner
      {...props}
      components={components}
      onChange={onChange}
      errorMessage={R.first(errors)?.message}
    />
  );
}

interface IZodNumberComponentProps extends IZodLeafComponentProps<zod.ZodNumber, number> {
  uiSchema?: UiPropertiesBase<number, any>;
}

const ZodNumberComponentInner = React.memo(function ZodNumberComponentInner({
  name,
  schema,
  value,
  isRequired,
  uiSchema,

  onChange,
  components,
  errorMessage
}: IZodNumberComponentProps & IZodInnerComponentProps) {
  const handleChange = React.useCallback(
    function handleChange(value?: number) {
      const isEmpty = R.isNil(value) || Number.isNaN(value);

      if (isEmpty) {
        return onChange({
          op: 'remove',
          path: componentNameDeserialize(name)
        });
      }

      return onChange({
        op: 'update',
        value,
        path: componentNameDeserialize(name)
      });
    },
    [name, onChange]
  );

  const Component = uiSchema?.component ?? components?.number ?? NumberDefault;

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={zodSchemaDescription(schema)}
      errorMessage={errorMessage}
      isRequired={isRequired}
      min={schema.minValue ?? undefined}
      max={schema.maxValue ?? undefined}
      {...getLeafPropsFromUiSchema(uiSchema)}
    />
  );
});

function ZodNumberComponent(props: IZodNumberComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors, isVisible } = useComponent(props.name);

  if (!isVisible) {
    return null;
  }

  return (
    <ZodNumberComponentInner
      {...props}
      errorMessage={R.first(errors)?.message}
      onChange={onChange}
      components={components}
    />
  );
}
interface IZodBooleanComponentProps extends IZodLeafComponentProps<zod.ZodBoolean, boolean> {
  uiSchema?: UiPropertiesBase<boolean, any>;
}

const ZodBooleanComponentInner = React.memo(function ZodBooleanComponentInner({
  name,
  schema,
  value,
  isRequired,
  uiSchema,

  onChange,
  components,
  errorMessage
}: IZodBooleanComponentProps & IZodInnerComponentProps) {
  const handleChange = React.useCallback(
    function handleChange(value: boolean) {
      onChange({
        op: 'update',
        value,
        path: componentNameDeserialize(name)
      });
    },
    [name, onChange]
  );

  const Component = uiSchema?.component ?? components?.boolean ?? BooleanDefault;

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={zodSchemaDescription(schema)}
      errorMessage={errorMessage}
      isRequired={isRequired}
      {...getLeafPropsFromUiSchema(uiSchema)}
    />
  );
});

function ZodBooleanComponent(props: IZodBooleanComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors, isVisible } = useComponent(props.name);

  if (!isVisible) {
    return null;
  }

  return (
    <ZodBooleanComponentInner
      {...props}
      components={components}
      errorMessage={R.first(errors)?.message}
      onChange={onChange}
    />
  );
}

interface IZodDateComponentProps extends IZodLeafComponentProps<zod.ZodDate, Date> {
  uiSchema?: UiPropertiesBase<Date, any>;
}

const ZodDateComponentInner = React.memo(function ZodDateComponentInner({
  name,
  schema,
  value,
  isRequired,
  uiSchema,

  onChange,
  components,
  errorMessage
}: IZodDateComponentProps & IZodInnerComponentProps) {
  const handleChange = React.useCallback(
    function handleChange(value: Date | undefined) {
      onChange({
        op: 'update',
        value,
        path: componentNameDeserialize(name)
      });
    },
    [name, onChange]
  );

  const Component = uiSchema?.component ?? components?.date ?? DateDefault;

  return (
    <Component
      value={value}
      onChange={handleChange}
      name={name}
      label={uiSchema?.label ?? name}
      description={zodSchemaDescription(schema)}
      errorMessage={errorMessage}
      isRequired={isRequired}
      {...getLeafPropsFromUiSchema(uiSchema)}
    />
  );
});

function ZodDateComponent(props: IZodDateComponentProps) {
  const { onChange, components } = useFormContext();
  const { errors, isVisible } = useComponent(props.name);

  if (!isVisible) {
    return null;
  }

  return (
    <ZodDateComponentInner
      {...props}
      components={components}
      errorMessage={R.first(errors)?.message}
      onChange={onChange}
    />
  );
}

interface IZodArrayComponentProps extends IZodLeafComponentProps<ZodAnyArray, any[]> {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  uiSchema?: UiPropertiesArray<any, any> | UiPropertiesMultiChoice<string, any>;
}

const ZodArrayMultiChoiceComponent = React.memo(function ZodArrayMultiChoiceComponent({
  schema,
  name,
  value = [],
  uiSchema,

  onChange,
  components,
  errorMessage
}: IZodArrayComponentProps & IZodInnerComponentProps) {
  const uiProps = (uiSchema ?? {}) as UiPropertiesMultiChoice<string, any>;
  const Component = uiProps.component ?? components?.multiChoice ?? MultiChoiceDefault;

  return (
    <Component
      {...uiProps}
      label={uiProps.label ?? name}
      name={name}
      errorMessage={errorMessage}
      onChange={(newValue) => {
        onChange({
          op: 'update',
          path: componentNameDeserialize(name),
          value: newValue
        });
      }}
      value={value}
      options={schema._def.type.options}
    />
  );
});

function ZodArrayComponent(props: IZodArrayComponentProps) {
  const { onChange, onArrayRemove, components } = useFormContext();
  const { errors, isVisible } = useComponent(props.name);

  const { schema, name, value, uiSchema } = props;
  const arraySchemaElement = schema._def.type;

  if (!isVisible) {
    return null;
  }

  if (isZodEnum(arraySchemaElement)) {
    return (
      <ZodArrayMultiChoiceComponent
        {...props}
        onChange={onChange}
        components={components}
        errorMessage={R.first(errors)?.message}
      />
    );
  }

  const uiProps = (uiSchema ?? {}) as UiPropertiesArray<any, any>;
  const Component = uiProps.component ?? components?.array ?? ArrayDefault;

  return (
    <Component
      description={zodSchemaDescription(schema) ?? uiProps.description}
      title={uiProps.title}
      onRemove={(index) => {
        onArrayRemove(componentNameDeserialize(`${name}[${index}]`));
      }}
      onAdd={() => {
        onChange({
          op: 'update',
          path: componentNameDeserialize(`${name}[${value?.length ?? 0}]`),
          value: formDefaultValueFromSchema(arraySchemaElement)
        });
      }}
    >
      {value?.map((item, index) => {
        const uniqueName = `${name}[${index}]`;
        return (
          <ZodAnyComponent
            key={uniqueName}
            name={uniqueName}
            schema={arraySchemaElement}
            value={item}
            uiSchema={uiProps.element}
          />
        );
      }) ?? []}
    </Component>
  );
}

function ZodObjectComponent({
  value,
  schema,
  name,
  uiSchema
}: {
  value: any;
  schema: AnyZodObject;
  uiSchema?: UiPropertiesObject<any, any>;
  name?: string;
}) {
  const { isVisible } = useComponent(name ?? '');
  const { components } = useFormContext();

  const children = React.useMemo(() => {
    const result = Object.entries(schema.shape).map(([thisName, thisSchema]) => {
      const childName = name ? [name, thisName].join('.') : thisName;

      return {
        name: thisName,
        component: (
          <ZodAnyComponent
            key={childName}
            name={childName}
            schema={thisSchema as ZodFirstPartySchemaTypes}
            value={value ? value[thisName] : undefined}
            uiSchema={uiSchema ? uiSchema[thisName] : undefined}
          />
        )
      };
    });

    if (uiSchema?.ui?.layout) {
      const children: Record<string, React.ReactNode> = {};
      for (const { name, component } of result) {
        children[name] = component;
      }
      return uiSchema.ui.layout({ children });
    }

    return result.map(({ component }) => component);
  }, [name, schema.shape, uiSchema, value]);

  if (!isVisible) {
    return null;
  }

  // Don't create a div as the first child of the form
  if (R.isNil(name)) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  const Component = uiSchema?.ui?.component ?? components?.object ?? ObjectDefault;

  return (
    <Component
      description={zodSchemaDescription(schema) ?? uiSchema?.ui?.description}
      {...R.omit(uiSchema?.ui ?? {}, ['component'])}
    >
      {children}
    </Component>
  );
}

const ZodAnyComponent = React.memo(function ZodAnyComponent({
  schema,
  name,
  isRequired = true,
  value,
  uiSchema
}: {
  schema: ZodFirstPartySchemaTypes;
  name?: string;
  isRequired?: boolean;
  value?: any;
  uiSchema?: any;
}) {
  if (isZodObject(schema)) {
    return <ZodObjectComponent uiSchema={uiSchema} value={value} schema={schema} name={name} />;
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
        schema={mergeZodOuterInnerType(schema)}
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
        schema={mergeZodOuterInnerType(schema)}
        name={name}
        isRequired={isRequired}
        value={value}
      />
    );
  }

  if (isZodDate(schema)) {
    return (
      <ZodDateComponent
        uiSchema={uiSchema}
        schema={schema}
        name={name}
        isRequired={isRequired}
        value={value}
      />
    );
  }

  if (isZodEffects(schema)) {
    return (
      <ZodAnyComponent
        uiSchema={uiSchema}
        schema={mergeZodOuterInnerType(schema)}
        name={name}
        isRequired={isRequired}
        value={value}
      />
    );
  }

  return null;
});

type ResolveComponentProps<Value> = Value extends Date
  ? IDateDefaultProps
  : Value extends boolean
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

type UiPropertiesBase<Value, RootSchema extends object> = {
  label?: React.ReactNode;
  component?: (props: ResolveComponentProps<Value | undefined>) => JSX.Element;
  autoFocus?: boolean;
  cond?: (data: PartialDeep<RootSchema>) => boolean;
  description?: React.ReactNode;
} & (Value extends boolean
  ? UiPropertiesBoolean
  : Value extends string
  ? UiPropertiesString
  : Value extends number
  ? UiPropertiesNumber
  : Value extends Date
  ? UiPropertiesDate
  : object);

type UiPropertiesNumber = object;

type UiPropertiesString = object;

type UiPropertiesBoolean = object;

type UiPropertiesDate = object;

export type UiPropertiesLeaf<Value> = Omit<UiPropertiesBase<Value, any>, 'component' | 'cond'>;

type UiPropertiesEnum<Schema extends string, RootSchema extends object> = Omit<
  UiPropertiesBase<Schema, RootSchema>,
  'component'
> & {
  component?: (props: IEnumDefaultProps) => JSX.Element;
  optionLabels?: Record<Schema, React.ReactNode>;
};

type UiPropertiesMultiChoice<Schema extends string, RootSchema extends object> = Pick<
  UiPropertiesEnum<Schema, RootSchema>,
  'optionLabels' | 'label' | 'cond'
> & {
  component?: (props: IMultiChoiceDefaultProps) => JSX.Element;
};

// These are the properties for non-leaf nodes such as array, object
type UiPropertiesCompoundInner<Schema extends object, RootSchema extends object> = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  cond?: (data: PartialDeep<RootSchema>) => boolean;
  component?: (props: ResolveComponentProps<Schema>) => JSX.Element;
};

export type UiPropertiesCompound<Schema extends object, RootSchema extends object> = Omit<
  UiPropertiesCompoundInner<Schema, RootSchema>,
  'cond' | 'component'
>;

type UiPropertiesObject<Schema extends object, RootSchema extends object> = UiSchemaInner<
  Schema,
  RootSchema
> & {
  ui?: UiPropertiesCompoundInner<Schema, RootSchema> & {
    layout?: (props: { children: Record<keyof Schema, React.ReactNode> }) => JSX.Element;
  };
};

/**
 * Arrays should allow for modifying the element type's ui schema too.
 * So, we do that through the `element` property.
 * */
type UiPropertiesArray<Schema extends Array<any>, RootSchema extends object> = (Schema extends Array<
  infer El extends object
>
  ? {
      element?: Omit<UiPropertiesObject<El, RootSchema>, 'ui'> & {
        ui?: Omit<Required<UiPropertiesObject<El, RootSchema>>['ui'], 'cond'>;
      };
    }
  : { element?: Omit<UiPropertiesBase<Schema[0], RootSchema>, 'cond'> }) &
  UiPropertiesCompoundInner<Schema, RootSchema>;

type ResolveArrayUiProperties<Schema extends Array<string>, RootSchema extends object> = Schema extends Array<
  infer El extends string
>
  ? IsUnion<El> extends true
    ? UiPropertiesMultiChoice<El, RootSchema>
    : UiPropertiesArray<Schema, RootSchema>
  : UiPropertiesArray<Schema, RootSchema>;

type ResolveUnionUiProperties<Schema, RootSchema extends object> = Schema extends string
  ? UiPropertiesEnum<Schema, RootSchema>
  : never;

type UiSchemaInner<Schema extends object, RootSchema extends object> = {
  // Boolean messes up the `IsNonUndefinedUnion` check, so we need to handle it first
  // TODO: Figure out how to handle this better
  [K in keyof Partial<Schema>]: Schema[K] extends Date
    ? UiPropertiesBase<Schema[K], RootSchema>
    : Schema[K] extends boolean
    ? UiPropertiesBase<Schema[K], RootSchema>
    : Schema[K] extends object
    ? Schema[K] extends Array<any>
      ? ResolveArrayUiProperties<Schema[K], RootSchema>
      : UiPropertiesObject<Schema[K], RootSchema>
    : IsUnion<Schema[K]> extends true
    ? ResolveUnionUiProperties<Schema[K], RootSchema>
    : UiPropertiesBase<Schema[K], RootSchema>;
};

export type FormUiSchema<Schema extends FormSchema> = UiSchemaInner<
  // We want to work with the pure type, undefined/null
  // doesn't really matter when trying to infer the UI schema
  RequiredDeep<zod.infer<Schema>>,
  zod.infer<Schema>
>;
export type FormValue<Schema extends FormSchema> = PartialDeep<zod.infer<Schema>>;
export type FormSchema = AnyZodObject | ZodEffects<any>;
export type FormOnChange<Schema extends FormSchema> = (
  updater: (oldValue: FormValue<Schema>) => FormValue<Schema>
) => void;

type FormChildren = (props: { errors: zod.ZodIssue[] }) => JSX.Element;
type FormConds = Record<string, CondResult>;

export interface IFormProps<Schema extends FormSchema> {
  schema: Schema;
  uiSchema?: FormUiSchema<Schema>;
  onSubmit?: (value: zod.infer<Schema>) => void;
  onChange?: FormOnChange<Schema>;
  value?: FormValue<Schema>;
  defaultValues?: zod.infer<Schema>;
  components?: {
    string?: (props: IStringDefaultProps) => JSX.Element;
    number?: (props: INumberDefaultProps) => JSX.Element;
    enum?: (props: IEnumDefaultProps) => JSX.Element;
    boolean?: (props: IBooleanDefaultProps) => JSX.Element;
    object?: (props: IObjectDefaultProps) => JSX.Element;
    array?: (props: IArrayDefaultProps) => JSX.Element;
    multiChoice?: (props: IMultiChoiceDefaultProps) => JSX.Element;
    date?: (props: IDateDefaultProps) => JSX.Element;
  };
  title?: React.ReactNode;
  children?: FormChildren;
  liveValidate?: boolean;
  onErrorsChange?: (errors: zod.ZodIssue[]) => void;
}

/**
 * Zod may wrap the schema in an effects
 * object (when using refine, for example)
 * so we need to resolve the schema to the actual
 * object schema from which we can generate the form
 * */
function resolveObjectSchema(schema: FormSchema): AnyZodObject {
  if (isZodObject(schema)) {
    return schema;
  }

  if (isZodEffects(schema)) {
    return resolveObjectSchema(schema._def.schema);
  }

  throw new Error(`Schema must be an object, got ${schema}`);
}

function resolveNextFormConds(formData: any, uiSchema: FormUiSchema<any>) {
  const conds = resolveUiSchemaConds({
    uiSchema,
    formData
  });

  return Object.fromEntries(conds.map((cond) => [componentNameSerialize(cond.path), cond]));
}

function getNextFormDataFromConds({
  formData,
  uiSchema
}: {
  formData: Record<string, any>;
  uiSchema: FormUiSchema<any>;
}) {
  const conds = resolveUiSchemaConds({
    uiSchema,
    formData
  });
  return produce(formData, (draft) => {
    conds.forEach(({ cond, path }) => {
      if (!cond) {
        unset(draft, path);
      }
    });
  });
}

type IFormReducerBasePayload<T> = T & {
  schema: FormSchema;
};

type IFormReducerAction =
  | {
      type: 'onChange';
      payload: IFormReducerBasePayload<{
        uiSchema: FormUiSchema<any>;
        event: ChangePayload;
        liveValidate?: boolean;
      }>;
    }
  | {
      type: 'arrayRemove';
      payload: IFormReducerBasePayload<{
        path: ComponentPath;
        liveValidate?: boolean;
      }>;
    }
  | {
      type: 'onError';
      payload: {
        errors: ErrorsMap;
      };
    }
  | {
      type: 'submitSuccess';
    };

interface IFormReducerState {
  formData: Record<string, any>;
  conds: FormConds;
  errors: ErrorsMap;
}

function validate(
  value: any,
  schema: FormSchema,
  uiSchema?: FormUiSchema<any>
):
  | {
      isValid: true;
      data: any;
    }
  | {
      isValid: false;
      errors: ErrorsMap;
    } {
  const parsed = schema.safeParse(
    getNextFormDataFromConds({
      formData: value,
      uiSchema: uiSchema ?? {}
    })
  );

  if (parsed.success) {
    return { isValid: true, data: parsed.data };
  } else {
    return {
      isValid: false,
      errors: R.groupBy(parsed.error.errors, (item) => componentNameSerialize(item.path))
    };
  }
}

const STABLE_NO_ERRORS = {};

function formNextValue(prev: any, event: ChangePayload): any {
  return produce(prev, (draft: any) => {
    if (event.op === 'update') {
      set(draft, event.path, event.value);
    } else {
      unset(draft, event.path, {
        arrayBehavior: 'setToUndefined'
      });
    }
  });
}

function formArrayRemove(prev: any, path: ComponentPath): any {
  return produce(prev, (draft: any) => {
    unset(draft, path, {
      arrayBehavior: 'delete'
    });
  });
}

function formReducer(
  state: IFormReducerState = {
    formData: {},
    conds: {},
    errors: STABLE_NO_ERRORS
  },
  action: IFormReducerAction
) {
  if (action.type === 'onChange') {
    const { uiSchema, event, liveValidate } = action.payload;

    const nextFormData = formNextValue(state.formData, event);

    const result = liveValidate ? validate(nextFormData, action.payload.schema, uiSchema) : undefined;

    return {
      ...state,
      conds: resolveNextFormConds(nextFormData, uiSchema),
      formData: nextFormData,
      errors: result ? (result.isValid ? STABLE_NO_ERRORS : result.errors) : state.errors
    };
  }

  if (action.type === 'arrayRemove') {
    const nextFormData = formArrayRemove(state.formData, action.payload.path);

    const result = action.payload.liveValidate ? validate(nextFormData, action.payload.schema) : undefined;

    return {
      ...state,
      formData: nextFormData,
      errors: result ? (result.isValid ? STABLE_NO_ERRORS : result.errors) : state.errors
    };
  }

  if (action.type === 'onError') {
    return {
      ...state,
      errors: action.payload.errors
    };
  }

  if (action.type === 'submitSuccess') {
    return {
      ...state,
      errors: STABLE_NO_ERRORS
    };
  }
}

function flattenErrorsToZodIssues(errors: ErrorsMap): zod.ZodIssue[] {
  return R.pipe(errors, R.values, R.flatten());
}

export function Form<Schema extends FormSchema>(props: IFormProps<Schema>) {
  useUncontrolledToControlledWarning(props.value);

  if (R.isNil(props.value)) {
    return <UncontrolledForm {...props} />;
  }

  return <ControlledForm {...props} />;
}

function UncontrolledForm<Schema extends FormSchema>({
  schema,
  uiSchema,

  onSubmit,
  value,
  defaultValues,

  components,
  title,

  children,
  liveValidate = false,
  onErrorsChange
}: IFormProps<Schema>) {
  const objectSchema = React.useMemo(() => resolveObjectSchema(schema), [schema]);

  const [state, dispatch] = React.useReducer(formReducer, undefined, () => {
    const formData = defaultValues ?? formDefaultValueFromSchema(objectSchema);
    const conds = resolveNextFormConds(formData, uiSchema ?? {});
    return {
      formData,
      conds,
      errors: STABLE_NO_ERRORS
    };
  });
  const { formData, conds, errors } = state!;

  const handleSubmit = React.useCallback(
    (value: typeof formData) => {
      const result = validate(value, schema, uiSchema ?? {});

      if (result.isValid) {
        dispatch({
          type: 'submitSuccess'
        });
        onSubmit?.(result.data);
      } else {
        dispatch({
          type: 'onError',
          payload: {
            errors: result.errors
          }
        });
      }
    },
    [onSubmit, schema, uiSchema]
  );

  const handleChange: OnChange = React.useCallback(
    (event) => {
      dispatch({
        type: 'onChange',
        payload: {
          event,
          uiSchema: uiSchema ?? {},
          schema,
          liveValidate
        }
      });
    },
    [liveValidate, schema, uiSchema]
  );

  const onArrayRemove = React.useCallback(
    (path: ComponentPath) => {
      dispatch({
        type: 'arrayRemove',
        payload: {
          path,
          schema,
          liveValidate
        }
      });
    },
    [liveValidate, schema]
  );

  React.useEffect(() => {
    onErrorsChange?.(flattenErrorsToZodIssues(errors));
  }, [errors, onErrorsChange]);

  return (
    <form
      style={{
        display: 'grid',
        gap: 32
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
          onArrayRemove
        }}
      >
        <ZodAnyComponent uiSchema={uiSchema} value={value ?? formData} schema={objectSchema} />
      </FormContextProvider>

      {children ? (
        children({ errors: flattenErrorsToZodIssues(errors) })
      ) : (
        <button type="submit">Submit</button>
      )}
    </form>
  );
}

function ControlledForm<Schema extends FormSchema>({
  schema,
  value,
  components,
  onChange,
  onErrorsChange,
  uiSchema,
  liveValidate,
  title,
  children,
  onSubmit
}: IFormProps<Schema>) {
  const [errors, setErrors] = React.useState<ErrorsMap>(STABLE_NO_ERRORS);
  const [conds, setConds] = React.useState<FormConds>(resolveNextFormConds(value, uiSchema ?? {}));

  const objectSchema = React.useMemo(() => resolveObjectSchema(schema), [schema]);

  const handleValidateResult = React.useCallback(
    (result: ReturnType<typeof validate>) => {
      if (result.isValid) {
        setErrors(STABLE_NO_ERRORS);
        onErrorsChange?.([]);
      } else {
        setErrors(result.errors);
        onErrorsChange?.(flattenErrorsToZodIssues(result.errors));
      }
    },
    [onErrorsChange]
  );

  const handleSubmit = React.useCallback(() => {
    const result = validate(value, schema, uiSchema ?? {});
    handleValidateResult(result);
    if (result.isValid) {
      onSubmit?.(result.data);
    }
  }, [handleValidateResult, onSubmit, schema, uiSchema, value]);

  const handleChange: OnChange = React.useCallback(
    (event) => {
      onChange?.((oldValue) => formNextValue(oldValue, event));
    },
    [onChange]
  );

  const onArrayRemove = React.useCallback(
    (path: ComponentPath) => {
      onChange?.((oldValue) => formArrayRemove(oldValue, path));
    },
    [onChange]
  );

  React.useEffect(() => {
    if (liveValidate) {
      handleValidateResult(validate(value, schema, uiSchema ?? {}));
    }
  }, [handleValidateResult, liveValidate, schema, uiSchema, value]);

  React.useEffect(() => {
    setConds(resolveNextFormConds(value, uiSchema ?? {}));
  }, [uiSchema, value]);

  return (
    <form
      style={{
        display: 'grid',
        gap: 32
      }}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      {title}

      <FormContextProvider
        value={{
          conds,
          errors,
          onChange: handleChange,
          components,
          onArrayRemove
        }}
      >
        <ZodAnyComponent uiSchema={uiSchema} value={value} schema={objectSchema} />
      </FormContextProvider>

      {children ? (
        children({ errors: flattenErrorsToZodIssues(errors) })
      ) : (
        <button type="submit">Submit</button>
      )}
    </form>
  );
}
