import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for no activity", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 0 when no day actually has attempts", () => {
    expect(computeStreak([{ activity_date: "2026-01-10", attempts_count: 0 }])).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const activity = [
      { activity_date: "2026-01-10", attempts_count: 2 },
      { activity_date: "2026-01-09", attempts_count: 1 },
      { activity_date: "2026-01-08", attempts_count: 1 },
    ];
    expect(computeStreak(activity)).toBe(3);
  });

  it("tolerates today not yet practiced, counting from yesterday", () => {
    const activity = [
      { activity_date: "2026-01-09", attempts_count: 1 },
      { activity_date: "2026-01-08", attempts_count: 1 },
    ];
    expect(computeStreak(activity)).toBe(2);
  });

  it("stops counting at the first gap", () => {
    const activity = [
      { activity_date: "2026-01-10", attempts_count: 1 },
      { activity_date: "2026-01-09", attempts_count: 1 },
      { activity_date: "2026-01-07", attempts_count: 1 }, // gap on 01-08
    ];
    expect(computeStreak(activity)).toBe(2);
  });

  it("breaks the streak when neither today nor yesterday has activity", () => {
    const activity = [{ activity_date: "2026-01-05", attempts_count: 3 }];
    expect(computeStreak(activity)).toBe(0);
  });
});
