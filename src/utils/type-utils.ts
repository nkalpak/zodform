import { UnionToIntersection } from "type-fest";

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
