import { describe, expect, it } from "vitest";
import { levelFor, statsByPartType } from "./partStats";

describe("statsByPartType", () => {
  it("counts correct and total per part type and skips ungraded items", () => {
    const stats = statsByPartType([
      { partType: "a", correct: true },
      { partType: "a", correct: false },
      { partType: "b", correct: true },
      { partType: "a", correct: null },
    ]);
    expect(stats).toEqual({ a: { correct: 1, total: 2 }, b: { correct: 1, total: 1 } });
  });
});

describe("levelFor", () => {
  it("has no data when never answered", () => {
    expect(levelFor(undefined)).toBe("no_data");
  });

  it("doesn't judge with too few answers", () => {
    expect(levelFor({ correct: 0, total: 3 })).toBe("learning");
  });

  it("flags a low accuracy as struggling once there are enough answers", () => {
    expect(levelFor({ correct: 2, total: 6 })).toBe("struggling");
  });

  it("calls a good accuracy solid", () => {
    expect(levelFor({ correct: 5, total: 6 })).toBe("solid");
  });

  it("treats exactly the threshold as solid", () => {
    expect(levelFor({ correct: 13, total: 20 })).toBe("solid"); // 65%
  });
});
