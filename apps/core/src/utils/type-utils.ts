import { UnionToIntersection } from 'type-fest';

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export type IsNonUndefinedUnion<T> = IsUnion<Exclude<T, undefined | null>> extends true ? true : false;

// Date is actually an object, but we don't want to recurse into it
export type RequiredDeep<T> = T extends Date
  ? T
  : T extends object
  ? { [K in keyof T]-?: RequiredDeep<T[K]> }
  : T extends Array<infer U>
  ? Array<RequiredDeep<U>>
  : T;
