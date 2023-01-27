export function componentNameDeserialize(name: string) {
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
    const result: (string | number)[] = [];
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
    const result: (string | number)[] = [];
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
