import { describe, expect, test } from "vitest";
import { unset } from "./unset";

describe("unset", function () {
  test("should unset a nested object property", function () {
    const obj = { a: { b: { c: 1 } } };
    unset(obj, ["a", "b", "c"]);
    expect(obj).toEqual({ a: { b: {} } });
  });

  test("should unset a nested array property", function () {
    const obj = { a: { b: [1, 2, 3] } };
    unset(obj, ["a", "b", 1]);
    expect(obj).toEqual({ a: { b: [1, 3] } });
  });

  test("should unset a nested array property with arrayBehavior set to 'setToUndefined'", function () {
    const obj = { a: { b: [1, 2, 3] } };
    unset(obj, ["a", "b", 1], { arrayBehavior: "setToUndefined" });
    expect(obj).toEqual({ a: { b: [1, undefined, 3] } });
  });
});
