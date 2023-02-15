import { Form, useForm } from './src/core/form';
import { parseArrayIndicesFromName } from './src/core/parse-array-indices-from-name';

import type {
  ComponentPath,
  FormUiSchema,
  FormValue,
  IFormProps,
  FormSchema,
  FormOnChange
} from './src/core/form';
import type { IArrayDefaultProps } from './src/components/default/array-default';
import type { IStringDefaultProps } from './src/components/default/string-default';
import type { IBooleanDefaultProps } from './src/components/default/boolean-default';
import type { INumberDefaultProps } from './src/components/default/number-default';
import type { IMultiChoiceDefaultProps } from './src/components/default/multi-choice-default';
import type { IEnumDefaultProps } from './src/components/default/enum-default';
import type { IObjectDefaultProps } from './src/components/default/object-default';

export { Form, useForm, parseArrayIndicesFromName };

export type {
  IFormProps,
  FormSchema,
  FormOnChange,
  IArrayDefaultProps,
  IStringDefaultProps,
  IBooleanDefaultProps,
  IEnumDefaultProps,
  IMultiChoiceDefaultProps,
  INumberDefaultProps,
  IObjectDefaultProps,
  ComponentPath,
  FormUiSchema,
  FormValue
};
