import * as R from "remeda";
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
    const { type, key: keyParts } = splitKey(key);
    let current = result;
    for (const key of keyParts.slice(0, -1)) {
      if (!current[key]) {
        current[key] = type === "array" ? [] : {};
      }
      current = current[key];
    }
    current[R.last(keyParts)!] = value;
  }
  return result;
}
