import type { AnyZodObject, ZodEffects, ZodFirstPartySchemaTypes, ZodString } from 'zod';
import * as zod from 'zod';
import { ZodArray, ZodBoolean, ZodDate, ZodDefault, ZodEnum, ZodNumber, ZodObject, ZodOptional } from 'zod';
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
import { IMultiChoiceDefaultProps, MultiChoiceDefault } from '../components/default/multi-choice-default';
import { PartialDeep } from 'type-fest';
import { CondResult, resolveUiSchemaConds } from './resolve-ui-schema-conds';
import { createContext } from '../utils/create-context';
import { DateDefault, IDateDefaultProps } from '../components/default/date-default';
import { mergeZodOuterInnerType } from './merge-zod-outer-inner-type';
import { ExtractSchemaFromEffects } from './extract-schema-from-effects';
import { IComponentProps } from '../components/types';
import * as Rhf from 'react-hook-form';
import { useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

const [useInternalFormContext, FormContextProvider] = createContext<{
  errors?: ErrorsMap;
  components?: Required<IFormProps<any>>['components'];
  conds: FormConds;
}>();

const FormContext = React.createContext<{
  value: any;
  update: (updater: (value: any) => void) => void;
}>({
  value: {},
  update: R.noop
});

export function useForm<Schema extends FormSchema>(): {
  value: FormValue<Schema>;
  update: (updater: (value: FormValue<Schema>) => void) => void;
} {
  return React.useContext(FormContext);
}

function isComponentVisible(name: string, conds: FormConds): boolean {
  return conds[name]?.cond ?? true;
}

function useComponent(name: string): {
  errors: zod.ZodIssue[];
  isVisible: boolean;
} {
  const { errors, conds } = useInternalFormContext();

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
  // We don't care about the type of "component", since we'll omit it anyway
  uiProps?: Omit<UiPropertiesBaseNew<ZodFirstPartySchemaTypes, any>, 'Component'> & { Component?: any }
) {
  return R.omit(uiProps ?? {}, ['Component', 'cond']);
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
  uiSchema?: UiPropertiesBaseNew<ZodString, any>;
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

  const Component = uiSchema?.Component ?? components?.string ?? StringDefault;

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
  const { components } = useInternalFormContext();
  const { isVisible } = useComponent(props.name);

  const { control } = Rhf.useFormContext();
  const { fieldState, field } = Rhf.useController({
    name: props.name,
    control
  });

  if (!isVisible) {
    return null;
  }

  return (
    <ZodStringComponentInner
      onChange={(data) => {
        if (data.op === 'update') {
          field.onChange(data.value);
        } else {
          field.onChange(undefined);
        }
      }}
      components={components}
      errorMessage={fieldState.error?.message}
      schema={props.schema}
      uiSchema={props.uiSchema}
      isRequired={props.isRequired}
      description={props.description}
      name={field.name}
      value={field.value}
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

  const Component = uiSchema?.Component ?? components?.enum ?? EnumDefault;

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
  const { components } = useInternalFormContext();
  const { isVisible } = useComponent(props.name);

  const { control } = Rhf.useFormContext();
  const { fieldState, field } = useController({
    name: props.name,
    control
  });

  if (!isVisible) {
    return null;
  }

  return (
    <ZodEnumComponentInner
      onChange={(data) => {
        if (data.op === 'update') {
          field.onChange(data.value);
        } else {
          field.onChange(undefined);
        }
      }}
      components={components}
      errorMessage={fieldState.error?.message}
      schema={props.schema}
      uiSchema={props.uiSchema}
      isRequired={props.isRequired}
      description={props.description}
      name={field.name}
      value={field.value}
    />
  );
}

interface IZodNumberComponentProps extends IZodLeafComponentProps<zod.ZodNumber, number> {
  uiSchema?: UiPropertiesBaseNew<ZodNumber, any>;
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

  const Component = uiSchema?.Component ?? components?.number ?? NumberDefault;

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
  const { components } = useInternalFormContext();
  const { isVisible } = useComponent(props.name);

  const { control } = Rhf.useFormContext();
  const { fieldState, field } = Rhf.useController({
    name: props.name,
    control
  });

  if (!isVisible) {
    return null;
  }

  return (
    <ZodNumberComponentInner
      onChange={(data) => {
        if (data.op === 'update') {
          field.onChange(data.value);
        } else {
          field.onChange(undefined);
        }
      }}
      components={components}
      errorMessage={fieldState.error?.message}
      schema={props.schema}
      uiSchema={props.uiSchema}
      isRequired={props.isRequired}
      description={props.description}
      name={field.name}
      value={field.value}
    />
  );
}
interface IZodBooleanComponentProps extends IZodLeafComponentProps<zod.ZodBoolean, boolean> {
  uiSchema?: UiPropertiesBaseNew<ZodBoolean, any>;
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

  const Component = uiSchema?.Component ?? components?.boolean ?? BooleanDefault;

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
  const { components } = useInternalFormContext();
  const { isVisible } = useComponent(props.name);

  const { control } = Rhf.useFormContext();
  const { fieldState, field } = Rhf.useController({
    name: props.name,
    control
  });

  if (!isVisible) {
    return null;
  }

  return (
    <ZodBooleanComponentInner
      onChange={(data) => {
        if (data.op === 'update') {
          field.onChange(data.value);
        } else {
          field.onChange(undefined);
        }
      }}
      components={components}
      errorMessage={fieldState.error?.message}
      schema={props.schema}
      uiSchema={props.uiSchema}
      isRequired={props.isRequired}
      description={props.description}
      name={field.name}
      value={field.value}
    />
  );
}

interface IZodDateComponentProps extends IZodLeafComponentProps<zod.ZodDate, Date> {
  uiSchema?: UiPropertiesBaseNew<ZodDate, any>;
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

  const Component = uiSchema?.Component ?? components?.date ?? DateDefault;

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
  const { components } = useInternalFormContext();
  const { isVisible } = useComponent(props.name);

  const { control } = Rhf.useFormContext();
  const { fieldState, field } = useController({
    name: props.name,
    control
  });

  if (!isVisible) {
    return null;
  }

  return (
    <ZodDateComponentInner
      onChange={(data) => {
        if (data.op === 'update') {
          field.onChange(data.value);
        } else {
          field.onChange(undefined);
        }
      }}
      components={components}
      errorMessage={fieldState.error?.message}
      schema={props.schema}
      uiSchema={props.uiSchema}
      isRequired={props.isRequired}
      description={props.description}
      name={field.name}
      value={field.value}
    />
  );
}

interface IZodArrayComponentProps extends IZodLeafComponentProps<ZodAnyArray, any[]> {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  uiSchema?: UiPropertiesArray<any, any> | UiPropertiesMultiChoice<ZodEnum<any>, any>;
}

const ZodArrayMultiChoiceComponentInner = React.memo(function ZodArrayMultiChoiceComponent({
  schema,
  name,
  value = [],
  uiSchema,

  onChange,
  components,
  errorMessage
}: IZodArrayComponentProps & IZodInnerComponentProps) {
  const uiProps = (uiSchema ?? {}) as UiPropertiesMultiChoice<ZodEnum<any>, any>;
  const Component = uiProps.Component ?? components?.multiChoice ?? MultiChoiceDefault;

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

function ZodArrayMultiChoiceComponent(props: IZodArrayComponentProps) {
  const { components } = useInternalFormContext();
  const { isVisible } = useComponent(props.name);

  const { control } = Rhf.useFormContext();
  const { fieldState, field } = useController({
    name: props.name,
    control
  });

  if (!isVisible) {
    return null;
  }

  return (
    <ZodArrayMultiChoiceComponentInner
      onChange={(data) => {
        if (data.op === 'update') {
          field.onChange(data.value);
        } else {
          field.onChange(undefined);
        }
      }}
      components={components}
      errorMessage={fieldState.error?.message}
      schema={props.schema}
      uiSchema={props.uiSchema}
      isRequired={props.isRequired}
      description={props.description}
      name={field.name}
      value={field.value}
    />
  );
}

function ZodArrayFieldComponent(props: IZodArrayComponentProps) {
  const { components } = useInternalFormContext();
  const { schema, uiSchema, value, name } = props;
  const arraySchemaElement = schema._def.type;

  const { control } = Rhf.useFormContext();
  const fieldArray = Rhf.useFieldArray({
    control,
    name: props.name
  });

  const uiProps = (uiSchema ?? {}) as UiPropertiesArray<any, any>;
  const Component = uiProps.Component ?? components?.array ?? ArrayDefault;

  return (
    <Component
      description={zodSchemaDescription(schema) ?? uiProps.description}
      title={uiProps.title}
      onRemove={(index) => {
        fieldArray.remove(index);
      }}
      onAdd={() => {
        fieldArray.append(formDefaultValueFromSchema(arraySchemaElement));
      }}
    >
      {fieldArray.fields.map((field, index) => {
        const uniqueName = componentNameSerialize([name, index]);

        return (
          <ZodAnyComponent
            key={field.id}
            name={uniqueName}
            schema={arraySchemaElement}
            // TODO: Remove this prop entirely
            value={value}
            uiSchema={uiProps.element}
          />
        );
      })}
    </Component>
  );
}

function ZodArrayComponent(props: IZodArrayComponentProps) {
  const { isVisible } = useComponent(props.name);
  const { schema } = props;

  if (!isVisible) {
    return null;
  }

  if (isZodEnum(schema._def.type)) {
    return <ZodArrayMultiChoiceComponent {...props} />;
  }

  return <ZodArrayFieldComponent {...props} />;
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
  const { components } = useInternalFormContext();

  const { setValue, getValues } = Rhf.useFormContext();

  const handleChange = React.useCallback(
    (updater: (old: any) => any) => {
      if (name) {
        const old = getValues(name);
        const newValue = updater(old);
        setValue(name, newValue);
      }
    },
    [name, setValue, getValues]
  );

  const children = (function () {
    const result = Object.entries(schema._def.shape()).map(([thisName, thisSchema]) => {
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

    if (uiSchema?.ui?.Layout) {
      const children: Record<string, React.ReactNode> = {};
      for (const { name, component } of result) {
        children[name] = component;
      }
      return uiSchema.ui.Layout({ children, value, onChange: handleChange });
    }

    return result.map(({ component }) => component);
  })();

  if (!isVisible) {
    return null;
  }

  // Don't create a div as the first child of the form
  if (R.isNil(name)) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  const Component = uiSchema?.ui?.Component ?? components?.object ?? ObjectDefault;

  return (
    <Component
      onChange={handleChange}
      value={value}
      description={zodSchemaDescription(schema) ?? uiSchema?.ui?.description}
      {...R.omit(uiSchema?.ui ?? {}, ['Component'])}
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

type ResolveComponentPropsFromSchema<Schema> = Schema extends ZodString
  ? IStringDefaultProps
  : Schema extends ZodNumber
  ? INumberDefaultProps
  : Schema extends ZodBoolean
  ? IBooleanDefaultProps
  : Schema extends ZodDate
  ? IDateDefaultProps
  : Schema extends ZodObject<any>
  ? IObjectDefaultProps & UiPropertiesObjectValue<Schema>
  : Schema extends ZodEnum<any>
  ? IEnumDefaultProps
  : Schema extends ZodArray<infer ItemSchema>
  ? ItemSchema extends ZodEnum<any>
    ? IMultiChoiceDefaultProps
    : IArrayDefaultProps
  : never;

type UiPropertiesBaseNew<Schema, RootSchema extends object> = {
  label?: React.ReactNode;
  Component?: (props: ResolveComponentPropsFromSchema<Schema>) => JSX.Element;
  cond?: (data: PartialDeep<RootSchema>) => boolean;
  description?: React.ReactNode;
};

type UiPropertiesEnum<Schema extends ZodEnum<any>, RootSchema extends object> = UiPropertiesBaseNew<
  Schema,
  RootSchema
> & {
  optionLabels?: Record<zod.infer<Schema>, string>;
};

type UiPropertiesMultiChoice<Schema extends ZodEnum<any>, RootSchema extends object> = Omit<
  UiPropertiesEnum<Schema, RootSchema>,
  'Component'
> & {
  Component?: (props: IMultiChoiceDefaultProps) => JSX.Element;
};

// These are the properties for non-leaf nodes such as array, object
type UiPropertiesCompoundInner<RootSchema extends object> = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  cond?: (data: PartialDeep<RootSchema>) => boolean;
};

export type UiPropertiesCompound<RootSchema extends object> = Omit<
  UiPropertiesCompoundInner<RootSchema>,
  'cond'
>;

type UiPropertiesObjectValue<Schema extends AnyZodObject> = {
  value: Partial<zod.infer<Schema>>;
  onChange: (updater: (old: Partial<zod.infer<Schema>>) => Partial<zod.infer<Schema>>) => void;
};

type UiPropertiesObject<Schema extends AnyZodObject, RootSchema extends object> = Partial<
  UiSchema<Schema, RootSchema>
> & {
  ui?: UiPropertiesCompoundInner<RootSchema> & {
    Layout?: (
      props: {
        children: Record<keyof zod.infer<Schema>, React.ReactNode>;
      } & UiPropertiesObjectValue<Schema>
    ) => JSX.Element;
    Component?: (props: ResolveComponentPropsFromSchema<Schema>) => JSX.Element;
  };
};

/**
 * Arrays should allow for modifying the element type's ui schema too.
 * So, we do that through the `element` property.
 * */
type UiPropertiesArray<Schema extends ZodArray<any>, RootSchema extends object> = (Schema extends ZodArray<
  infer El extends AnyZodObject
>
  ? {
      element?: Omit<UiPropertiesObject<El, RootSchema>, 'ui'> & {
        ui?: Omit<Required<UiPropertiesObject<El, RootSchema>>['ui'], 'cond'>;
      };
    }
  : { element?: Omit<UiPropertiesBaseNew<Schema, RootSchema>, 'cond'> }) &
  (UiPropertiesCompoundInner<RootSchema> & {
    Component?: (props: IArrayDefaultProps) => JSX.Element;
  });

type ResolveArrayUiSchema<Schema extends ZodArray<any>, RootSchema extends object> = Schema extends ZodArray<
  infer El
>
  ? El extends ZodEnum<any>
    ? UiPropertiesMultiChoice<El, RootSchema>
    : UiPropertiesArray<Schema, RootSchema>
  : never;

type OmitComponentProps<T extends IComponentProps<any>> = Omit<T, keyof IComponentProps<any>>;

type UiSchemaZodTypeResolver<
  Schema extends ZodFirstPartySchemaTypes,
  RootSchema extends object
> = Schema extends ZodEffects<infer Inner, any, any>
  ? UiSchemaZodTypeResolver<Inner, RootSchema>
  : Schema extends ZodOptional<infer Inner> | ZodDefault<infer Inner>
  ? UiSchemaZodTypeResolver<Inner, RootSchema>
  : Schema extends ZodDate
  ? UiPropertiesBaseNew<Schema, RootSchema> & OmitComponentProps<IDateDefaultProps>
  : Schema extends ZodBoolean
  ? UiPropertiesBaseNew<Schema, RootSchema> & OmitComponentProps<IBooleanDefaultProps>
  : Schema extends ZodObject<any>
  ? UiPropertiesObject<Schema, RootSchema> & Omit<IObjectDefaultProps, 'children'>
  : Schema extends ZodArray<any>
  ? ResolveArrayUiSchema<Schema, RootSchema> & Omit<IArrayDefaultProps, 'onAdd' | 'onRemove' | 'children'>
  : Schema extends ZodEnum<any>
  ? UiPropertiesEnum<Schema, RootSchema> & Omit<OmitComponentProps<IEnumDefaultProps>, 'options'>
  : Schema extends ZodString
  ? UiPropertiesBaseNew<Schema, RootSchema> & OmitComponentProps<IStringDefaultProps>
  : Schema extends ZodNumber
  ? UiPropertiesBaseNew<Schema, RootSchema> & OmitComponentProps<INumberDefaultProps>
  : UiPropertiesBaseNew<Schema, RootSchema>;

type UiSchema<
  Schema extends FormSchema,
  RootSchema extends object,
  ExtractedSchema = ExtractSchemaFromEffects<Schema>
> = ExtractedSchema extends AnyZodObject
  ? {
      [K in keyof ExtractedSchema['shape']]: UiSchemaZodTypeResolver<ExtractedSchema['shape'][K], RootSchema>;
    }
  : ExtractedSchema;

export type FormUiSchema<Schema extends FormSchema> = Partial<UiSchema<Schema, zod.infer<Schema>>>;

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
    }
  | {
      type: 'set';
      payload: IFormReducerBasePayload<{
        value: any;
        liveValidate?: boolean;
        uiSchema: FormUiSchema<any>;
      }>;
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

  if (action.type === 'set') {
    const { uiSchema, value, schema, liveValidate } = action.payload;
    const result = liveValidate ? validate(value, schema, uiSchema) : undefined;

    return {
      ...state,
      conds: resolveNextFormConds(value, uiSchema),
      formData: value,
      errors: result ? (result.isValid ? STABLE_NO_ERRORS : result.errors) : state.errors
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
  const formMethods = Rhf.useForm({
    resolver: zodResolver(objectSchema),
    defaultValues: defaultValues ?? formDefaultValueFromSchema(objectSchema)
  });

  const [state, dispatch] = React.useReducer(formReducer, undefined, () => {
    const formData = defaultValues ?? formDefaultValueFromSchema(objectSchema);
    const conds = resolveNextFormConds(formData, uiSchema ?? {});
    return {
      formData,
      conds,
      errors: STABLE_NO_ERRORS
    };
  });
  const { formData, errors } = state!;

  const [conds, setConds] = React.useState<FormConds>({});

  formMethods.watch((value) => {
    setConds(resolveNextFormConds(value, uiSchema ?? {}));
  });

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

  const updateForm = React.useCallback(
    (updater: (old: any) => void) => {
      const newData = produce(formData, updater);
      dispatch({
        type: 'set',
        payload: {
          value: newData,
          schema,
          uiSchema: uiSchema ?? {},
          liveValidate
        }
      });
    },
    [formData, liveValidate, schema, uiSchema]
  );

  React.useEffect(() => {
    onErrorsChange?.(flattenErrorsToZodIssues(errors));
  }, [errors, onErrorsChange]);

  const rhfValue = formMethods.watch();
  console.log(rhfValue);
  console.log('-'.repeat(80));

  return (
    <form
      style={{
        display: 'grid',
        gap: 32
      }}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(formData);
        formMethods.handleSubmit(
          (data) => {
            console.log('submit', data);
          },
          (errors) => {
            console.log('error', errors);
          }
        )(event);
      }}
    >
      {title}

      <FormContextProvider
        value={{
          conds,
          errors,
          components
        }}
      >
        <FormContext.Provider value={{ value: formData, update: updateForm }}>
          <Rhf.FormProvider {...formMethods}>
            <ZodAnyComponent uiSchema={uiSchema} value={value ?? formData} schema={objectSchema} />
          </Rhf.FormProvider>
        </FormContext.Provider>
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

  const handleUpdate = React.useCallback(
    (updater: (value: any) => void) => {
      onChange?.((oldValue) => {
        const res: any = produce(oldValue, (draft: any) => {
          updater(draft);
        });
        return res;
      });
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
          components
        }}
      >
        <FormContext.Provider value={{ value, update: handleUpdate }}>
          <ZodAnyComponent uiSchema={uiSchema} value={value} schema={objectSchema} />
        </FormContext.Provider>
      </FormContextProvider>

      {children ? (
        children({ errors: flattenErrorsToZodIssues(errors) })
      ) : (
        <button type="submit">Submit</button>
      )}
    </form>
  );
}
