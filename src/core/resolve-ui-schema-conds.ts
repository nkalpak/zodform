import * as R from "remeda";
import { ComponentPath, UiSchema } from "./form";
import { componentNameDeserialize } from "../utils/component-name-deserialize";
import React from "react";

function extractCondsFromUiSchema(uiSchema: UiSchema<any>) {
  const conds: Record<string, (formData: any) => boolean> = {};

  function traverse(uiSchema: UiSchema<any>, path: ComponentPath = []): void {
    for (const key in uiSchema) {
      const value = uiSchema[key];

      // Skip React elements as no cond will be found traversing those
      if (R.isNil(value) || React.isValidElement(value)) {
        continue;
      }

      if (typeof value === "object") {
        if ("ui" in value) {
          const name = [...path, key].join(".");
          if (value.ui?.cond) {
            conds[name] = value.ui.cond;
          }
        }
        // If it's the object's ui property
        if (key !== "ui") {
          traverse(value, [...path, key]);
        }
        // If it's the array's element property
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

export type CondResult = {
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
}): CondResult[] {
  const result = extractCondsFromUiSchema(uiSchema);
  return Object.entries(result).map(([path, cond]) => ({
    cond: cond(formData),
    path: componentNameDeserialize(path),
  }));
}
