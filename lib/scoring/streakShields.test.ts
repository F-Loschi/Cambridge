import { describe, expect, it } from "vitest";
import { shieldMilestonesEarned } from "./streakShields";

describe("shieldMilestonesEarned", () => {
  it("earns nothing before the first 7-day milestone", () => {
    expect(shieldMilestonesEarned(0)).toBe(0);
    expect(shieldMilestonesEarned(6)).toBe(0);
  });

  it("earns one at exactly 7 days", () => {
    expect(shieldMilestonesEarned(7)).toBe(1);
  });

  it("earns one more per additional 7-day block", () => {
    expect(shieldMilestonesEarned(13)).toBe(1);
    expect(shieldMilestonesEarned(14)).toBe(2);
    expect(shieldMilestonesEarned(30)).toBe(4);
  });
});
