export type AnyFunction = (...args: any[]) => any;

// Date is actually an object, but we don't want to recurse into it
export type RequiredDeep<T> = T extends AnyFunction | Date | Array<any>
  ? T
  : T extends object
  ? { [K in keyof T]-?: RequiredDeep<T[K]> }
  : T;
