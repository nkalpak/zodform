import { describe, expect, test } from "vitest";
import { componentNameDeserialize } from "./component-name-deserialize";

describe("componentNameDeserialize", () => {
  test("should return the name", () => {
    expect(componentNameDeserialize("name")).toEqual(["name"]);
    expect(componentNameDeserialize("a.b.c")).toEqual(["a", "b", "c"]);
    expect(componentNameDeserialize("a[0].b[1].c")).toEqual([
      "a",
      0,
      "b",
      1,
      "c",
    ]);
    expect(componentNameDeserialize("a[0][1]")).toEqual(["a", 0, 1]);
  });
});
