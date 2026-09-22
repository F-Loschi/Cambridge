import { describe, expect, it } from "vitest";
import { computeEarnedBadgeIds, type BadgeStats } from "./badges";

const baseStats: BadgeStats = {
  totalAnswered: 0,
  streak: 0,
  bestScoreBySkill: {
    reading_use_of_english: null,
    writing: null,
    listening: null,
    speaking: null,
  },
  reviewItemsTotal: 0,
  reviewItemsDue: 0,
};

describe("computeEarnedBadgeIds", () => {
  it("earns nothing from a blank slate", () => {
    expect(computeEarnedBadgeIds(baseStats).size).toBe(0);
  });

  it("earns first_answer as soon as one question is answered", () => {
    const earned = computeEarnedBadgeIds({ ...baseStats, totalAnswered: 1 });
    expect(earned.has("first_answer")).toBe(true);
  });

  it("earns streak_7 and streak_30 at their thresholds independently", () => {
    expect(computeEarnedBadgeIds({ ...baseStats, streak: 7 }).has("streak_7")).toBe(true);
    expect(computeEarnedBadgeIds({ ...baseStats, streak: 7 }).has("streak_30")).toBe(false);
    expect(computeEarnedBadgeIds({ ...baseStats, streak: 30 }).has("streak_30")).toBe(true);
  });

  it("earns reached_c1 when any skill's best score clears the C1 threshold", () => {
    const earned = computeEarnedBadgeIds({
      ...baseStats,
      bestScoreBySkill: { ...baseStats.bestScoreBySkill, writing: 180 },
    });
    expect(earned.has("reached_c1")).toBe(true);
  });

  it("does not earn error_bank_cleared with an empty (never-used) review queue", () => {
    expect(computeEarnedBadgeIds({ ...baseStats, reviewItemsTotal: 0, reviewItemsDue: 0 }).has("error_bank_cleared")).toBe(false);
  });

  it("earns error_bank_cleared once the queue has been used and nothing is due", () => {
    const earned = computeEarnedBadgeIds({ ...baseStats, reviewItemsTotal: 5, reviewItemsDue: 0 });
    expect(earned.has("error_bank_cleared")).toBe(true);
  });

  it("earns marathon_50 at 50 total answered questions", () => {
    expect(computeEarnedBadgeIds({ ...baseStats, totalAnswered: 49 }).has("marathon_50")).toBe(false);
    expect(computeEarnedBadgeIds({ ...baseStats, totalAnswered: 50 }).has("marathon_50")).toBe(true);
  });
});
