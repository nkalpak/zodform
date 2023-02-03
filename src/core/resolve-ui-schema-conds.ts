import { ComponentPath, UiSchema } from "./form";
import { componentNameDeserialize } from "../utils/component-name-deserialize";

function extractCondsFromUiSchema(uiSchema: UiSchema<any>) {
  const conds: Record<string, (formData: any) => boolean> = {};

  function traverse(uiSchema: UiSchema<any>, path: ComponentPath = []): void {
    for (const key in uiSchema) {
      const value = uiSchema[key];
      if (typeof value === "object") {
        if ("ui" in value) {
          const name = [...path, key].join(".");
          if (value.ui?.cond) {
            conds[name] = value.ui.cond;
          }
        }
        if (key !== "ui") {
          traverse(value, [...path, key]);
        }
        if (key === "element") {
          traverse(value, path);
        }
      } else if (key === "cond") {
        conds[path.join(".")] = value;
      }
    }
  }

  traverse(uiSchema);

  return conds;
}

type ResolvedProperty = {
  path: ComponentPath;
  cond: boolean;
};

/**
 * UiSchema specifies a `cond` property, which determines
 * whether the field should be shown in the form or not.
 *
 * This function runs all `cond` functions and defines
 * a mapping from the property path to a boolean value.
 * */
export function resolveUiSchemaConds({
  uiSchema,
  formData,
}: {
  formData: Record<string, any>;
  uiSchema: UiSchema<any>;
}): ResolvedProperty[] {
  const result = extractCondsFromUiSchema(uiSchema);
  return Object.entries(result).map(([path, cond]) => ({
    cond: cond(formData),
    path: componentNameDeserialize(path),
  }));
}
