import { describe, expect, it } from "vitest";
import { isAnswerCorrect } from "./grading";

describe("isAnswerCorrect", () => {
  it("ignores case and surrounding whitespace", () => {
    expect(isAnswerCorrect("  Had Been ", "had been")).toBe(true);
  });

  it("collapses internal whitespace differences", () => {
    expect(isAnswerCorrect("had   been", "had been")).toBe(true);
  });

  it("returns false for genuinely different answers", () => {
    expect(isAnswerCorrect("have been", "had been")).toBe(false);
  });
});
