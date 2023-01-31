import { UnionToIntersection } from "type-fest";

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export type IsNonUndefinedUnion<
  T,
  TX = Exclude<T, undefined>
> = IsUnion<TX> extends true ? true : false;
