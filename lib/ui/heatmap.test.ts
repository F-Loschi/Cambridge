import { describe, expect, it } from "vitest";
import { buildHeatmapWeeks, intensityLevel } from "./heatmap";

describe("buildHeatmapWeeks", () => {
  it("produces weeksCount columns of exactly 7 days", () => {
    const weeks = buildHeatmapWeeks([], 12, new Date("2026-01-10T12:00:00Z"));
    expect(weeks).toHaveLength(12);
    weeks.forEach((w) => expect(w).toHaveLength(7));
  });

  it("ends on today with no future dates", () => {
    const weeks = buildHeatmapWeeks([], 3, new Date("2026-01-10T12:00:00Z"));
    const lastDay = weeks[weeks.length - 1][6];
    expect(lastDay.date).toBe("2026-01-10");
  });

  it("looks up counts from the activity map and defaults missing days to 0", () => {
    const weeks = buildHeatmapWeeks(
      [{ activity_date: "2026-01-10", questions_answered: 4 }],
      2,
      new Date("2026-01-10T12:00:00Z"),
    );
    const flat = weeks.flat();
    expect(flat.find((d) => d.date === "2026-01-10")?.count).toBe(4);
    expect(flat.find((d) => d.date === "2026-01-09")?.count).toBe(0);
  });
});

describe("intensityLevel", () => {
  it("buckets counts into 5 levels", () => {
    expect(intensityLevel(0)).toBe(0);
    expect(intensityLevel(1)).toBe(1);
    expect(intensityLevel(3)).toBe(2);
    expect(intensityLevel(6)).toBe(3);
    expect(intensityLevel(10)).toBe(4);
  });
});
