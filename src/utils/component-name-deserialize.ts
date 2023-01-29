type Path = (string | number)[];

/**
 * Deserializes a component name into an array of strings and numbers.
 *
 * Examples:
 *  - name => ["name"]
 *  - a.b.c => ["a", "b", "c"]
 *  - a[0].b[1].c => ["a", 0, "b", 1, "c"]
 *  - a[0][1] => ["a", 0, 1]
 * */
export function componentNameDeserialize(name: string): Path {
  const hasObjectSeparator = name.includes(".");
  const hasArraySeparator = name.includes("[");

  if (hasObjectSeparator) {
    return resolveObject(name);
  }

  if (hasArraySeparator) {
    return resolveMatrix(name);
  }

  return [name];

  function resolveObject(name: string) {
    const result: Path = [];
    for (const part of name.split(".")) {
      const [key, index] = part.split("[");
      if (key) {
        result.push(key!);
      }
      if (index) {
        result.push(parseInt(index!));
      }
    }
    return result;
  }

  function resolveMatrix(name: string) {
    const result: Path = [];
    for (const part of name.split("[")) {
      const [key] = part.split("]");
      const asNumber = parseInt(key!);
      if (Number.isNaN(asNumber)) {
        result.push(key!);
      } else {
        result.push(asNumber);
      }
    }
    return result;
  }
}

export function componentNameSerialize(name: Path) {
  return name
    .map((part) => (typeof part === "number" ? `[${part}]` : part))
    .join(".");
}
