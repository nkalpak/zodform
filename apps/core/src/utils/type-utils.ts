import { UnionToIntersection } from 'type-fest';

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export type IsNonUndefinedUnion<T> = IsUnion<Exclude<T, undefined | null>> extends true ? true : false;
