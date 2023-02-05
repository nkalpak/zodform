import { Form } from "./core/form";

import type { ComponentPath, FormUiSchema, FormValue } from "./core/form";
import type { IArrayDefaultProps } from "./components/default/array-default";
import type { IStringDefaultProps } from "./components/default/string-default";
import type { IBooleanDefaultProps } from "./components/default/boolean-default";
import type { INumberDefaultProps } from "./components/default/number-default";
import type { IMultiChoiceDefaultProps } from "./components/default/multi-choice-default";
import type { IEnumDefaultProps } from "./components/default/enum-default";
import type { IObjectDefaultProps } from "./components/default/object-default";

export { Form };

export type {
  IArrayDefaultProps,
  IStringDefaultProps,
  IBooleanDefaultProps,
  IEnumDefaultProps,
  IMultiChoiceDefaultProps,
  INumberDefaultProps,
  IObjectDefaultProps,
  ComponentPath,
  FormUiSchema,
  FormValue,
};
