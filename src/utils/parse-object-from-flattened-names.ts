import set from "lodash.set";
import { componentNameDeserialize } from "./component-name-deserialize";

function splitKey(key: string) {
  const path = componentNameDeserialize(key);
  const isArray = path.some((part) => typeof part === "number");
  return {
    type: isArray ? "array" : "normal",
    key: path,
  };
}

export function parseObjectFromFlattenedEntries(entries: [string, unknown][]) {
  const result: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    set(result, key, value);
  }

  return result;
}
