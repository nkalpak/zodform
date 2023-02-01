import { ComponentPath } from "../core/form";
import * as R from "remeda";

interface IUnsetOptions {
  // What to do when the path points to an array element?
  arrayBehavior?: "delete" | "setToUndefined";
}

export function unset(
  obj: Record<string, any>,
  path: ComponentPath,
  options: IUnsetOptions = {
    arrayBehavior: "delete",
  }
): void {
  let current = obj;
  for (const key of path.slice(0, -1)) {
    current = current[key];
    if (R.isNil(current)) {
      return;
    }
  }

  const lastKey = path[path.length - 1];
  if (R.isNil(lastKey)) {
    return;
  }

  if (Array.isArray(current)) {
    if (typeof lastKey !== "number") {
      return;
    }
    if (options.arrayBehavior === "delete") {
      current.splice(lastKey, 1);
    } else {
      current[lastKey] = undefined;
    }
    return;
  }

  if (typeof current === "object") {
    delete current[lastKey];
    return;
  }
}
