type RhfError = {
  message: string;
  ref: {
    name: string;
  };
};

type RhfErrors = Record<
  string,
  Record<string, RhfError> | RhfError[] | Record<string, RhfError>[] | RhfError
>;

export interface IFormError {
  name: string;
  message: string;
}

function isRhfError(value: any): value is RhfError {
  return value && value.message && value.ref && value.ref.name;
}

export function mapRhfErrors(errors: RhfErrors): IFormError[] {
  function iterate(errors: RhfErrors): IFormError[] {
    const result: IFormError[] = [];

    for (const error of Object.values(errors)) {
      if (isRhfError(error)) {
        result.push({
          message: error.message,
          name: error.ref.name
        });
        continue;
      }

      if (Array.isArray(error)) {
        for (const item of error) {
          if (isRhfError(item)) {
            result.push({
              message: item.message,
              name: item.ref.name
            });
          } else {
            result.push(...iterate(item));
          }
        }
        continue;
      }

      result.push(...iterate(error));
    }

    return result;
  }

  return iterate(errors);
}
