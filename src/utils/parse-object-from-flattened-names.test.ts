import { expect, test, describe } from "vitest";
import { parseObjectFromFlattenedEntries } from "./parse-object-from-flattened-names";

describe("parseObjectFromFlattenedEntries", function () {
  test("should work with nested objects", function () {
    const actual = parseObjectFromFlattenedEntries([
      ["a.b.c", 1],
      ["a.b.d", 2],
    ]);

    expect(actual).toEqual({
      a: {
        b: {
          c: 1,
          d: 2,
        },
      },
    });
  });

  test("should work with arrays", function () {
    const actual = parseObjectFromFlattenedEntries([
      ["a[0]", 1],
      ["a[1]", 2],
    ]);

    expect(actual).toEqual({
      a: [1, 2],
    });
  });

  test("should work with nested arrays", function () {
    const actual = parseObjectFromFlattenedEntries([
      ["a[0][0]", 1],
      ["a[0][1]", 2],
      ["a[1][0]", 3],
      ["a[1][1]", 4],
    ]);

    expect(actual).toEqual({
      a: [
        [1, 2],
        [3, 4],
      ],
    });
  });
});
