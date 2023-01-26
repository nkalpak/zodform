import { expect, it, describe } from "vitest";
import { parseObjectFromFlattenedEntries } from "./parse-object-from-flattened-names";

describe("parse-object-from-flattened-names", function () {
  it("should work", function () {
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
});
