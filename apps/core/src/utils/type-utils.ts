import { UnionToIntersection } from 'type-fest';

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export type IsNonUndefinedUnion<T> = IsUnion<Exclude<T, undefined | null>> extends true ? true : false;
export type AnyFunction = (...args: any[]) => any;

// Date is actually an object, but we don't want to recurse into it
export type RequiredDeep<T> = T extends AnyFunction | Date | Array<any>
  ? T
  : T extends object
  ? { [K in keyof T]-?: RequiredDeep<T[K]> }
  : T;
