import { ComponentPath } from "../core/form";
import * as R from "remeda";

export function unset(obj: Record<string, any>, path: ComponentPath): void {
  let current = obj;
  for (const key of path.slice(0, -1)) {
    current = current[key];
  }

  if (R.isNil(current)) {
    return;
  }

  if (Array.isArray(current)) {
    current.splice(path[path.length - 1], 1);
    return;
  }

  if (typeof current === "object") {
    delete current[path[path.length - 1]!];
    return;
  }
}
