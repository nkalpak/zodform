export function parseObjectFromFlattenedEntries(entries: [string, unknown][]) {
  const result: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    const keys = key.split(".");
    let current = result;
    for (const key of keys.slice(0, -1)) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
  return result;
}
