import { describe, expect, it } from "vitest";
import { daysUntilExam } from "./examCountdown";

const now = new Date("2026-01-10T15:00:00Z");

describe("daysUntilExam", () => {
  it("returns null when no exam date is set", () => {
    expect(daysUntilExam(null, now)).toBeNull();
  });

  it("returns 0 for today", () => {
    expect(daysUntilExam("2026-01-10", now)).toBe(0);
  });

  it("returns a positive count for a future date", () => {
    expect(daysUntilExam("2026-02-09", now)).toBe(30);
  });

  it("returns a negative count for a past date", () => {
    expect(daysUntilExam("2026-01-05", now)).toBe(-5);
  });
});
