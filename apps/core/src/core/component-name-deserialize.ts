type Path = (string | number)[];

/**
 * Deserializes a component name into an array of strings and numbers.
 * */
export function componentNameDeserialize(name: string): Path {
  return name.split('.').map((part) => {
    const asNumber = parseInt(part);
    if (Number.isNaN(asNumber)) {
      return part;
    }
    return asNumber;
  });
}

export function componentNameSerialize(name: Path) {
  return name.join('.');
}
