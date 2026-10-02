import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  it("keeps the same elements, just reordered", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("eventually produces a different order across many runs", () => {
    const input = Array.from({ length: 10 }, (_, i) => i);
    const everSame = Array.from({ length: 50 }, () => shuffle(input)).every(
      (result) => result.join(",") === input.join(","),
    );
    expect(everSame).toBe(false);
  });
});
