import { Form } from "./src/core/form";

import type { ComponentPath, FormUiSchema, FormValue } from "./src/core/form";
import type { IArrayDefaultProps } from "./src/components/default/array-default";
import type { IStringDefaultProps } from "./src/components/default/string-default";
import type { IBooleanDefaultProps } from "./src/components/default/boolean-default";
import type { INumberDefaultProps } from "./src/components/default/number-default";
import type { IMultiChoiceDefaultProps } from "./src/components/default/multi-choice-default";
import type { IEnumDefaultProps } from "./src/components/default/enum-default";
import type { IObjectDefaultProps } from "./src/components/default/object-default";

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
