import { describe, expect, it } from "vitest";
import { dueDateAfter, INITIAL_REVIEW_STATE, nextReviewState } from "./spacedRepetition";

describe("nextReviewState", () => {
  it("resets interval to 1 day and lowers ease on a wrong answer", () => {
    const result = nextReviewState({ intervalDays: 7, ease: 2.5 }, false);
    expect(result.intervalDays).toBe(1);
    expect(result.ease).toBe(2.3);
  });

  it("never drops ease below 1.3", () => {
    const result = nextReviewState({ intervalDays: 1, ease: 1.35 }, false);
    expect(result.ease).toBe(1.3);
  });

  it("grows the interval in fixed steps for the first two correct reviews", () => {
    const afterFirst = nextReviewState(INITIAL_REVIEW_STATE, true);
    expect(afterFirst.intervalDays).toBe(3);
    const afterSecond = nextReviewState(afterFirst, true);
    expect(afterSecond.intervalDays).toBe(7);
  });

  it("multiplies by ease once the interval is established", () => {
    const result = nextReviewState({ intervalDays: 7, ease: 2.5 }, true);
    expect(result.intervalDays).toBe(18); // round(7 * 2.5)
  });

  it("never raises ease above 2.8", () => {
    const result = nextReviewState({ intervalDays: 10, ease: 2.78 }, true);
    expect(result.ease).toBe(2.8);
  });
});

describe("dueDateAfter", () => {
  it("adds the interval to the given date", () => {
    expect(dueDateAfter(5, new Date("2026-01-10T12:00:00Z"))).toBe("2026-01-15");
  });
});
