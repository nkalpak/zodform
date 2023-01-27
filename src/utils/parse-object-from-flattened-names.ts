import * as R from "remeda";

function splitKey(key: string) {
  if (isArrayKey(key)) {
    const [arrayKey, index] = key.split("[");
    return {
      type: "array",
      key: [arrayKey!, parseInt(index!.replace("]", ""))!],
    } as const;
  }

  return {
    type: "normal",
    key: key.split("."),
  } as const;

  function isArrayKey(key: string) {
    return key.includes("[") && key.includes("]");
  }
}

export function parseObjectFromFlattenedEntries(entries: [string, unknown][]) {
  const result: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    const { type, key: keyParts } = splitKey(key);
    if (type === "array") {
      const [arrayKey, index] = keyParts;
      if (!result[arrayKey]) {
        result[arrayKey] = [];
      }
      result[arrayKey][index] = value;
      continue;
    }
    if (type === "normal") {
      let current = result;
      for (const key of keyParts.slice(0, -1)) {
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      current[R.last(keyParts)!] = value;
    }
  }
  return result;
}
