import { describe, expect, it } from "vitest";
import { averageScoreBySkill, bandFor, CAMBRIDGE_SCALE, overallScore } from "./scale";

describe("averageScoreBySkill", () => {
  it("averages multiple attempts per skill and nulls out skills with none", () => {
    const attempts = [
      { skill: "writing" as const, scaled_score: 180, started_at: "" },
      { skill: "writing" as const, scaled_score: 190, started_at: "" },
      { skill: "listening" as const, scaled_score: 170, started_at: "" },
    ];
    const result = averageScoreBySkill(attempts);
    expect(result.writing).toBe(185);
    expect(result.listening).toBe(170);
    expect(result.reading_use_of_english).toBeNull();
    expect(result.speaking).toBeNull();
  });

  it("ignores attempts with a null scaled_score", () => {
    const attempts = [{ skill: "writing" as const, scaled_score: null, started_at: "" }];
    expect(averageScoreBySkill(attempts).writing).toBeNull();
  });
});

describe("overallScore", () => {
  it("returns null unless every skill has a score", () => {
    const partial = {
      reading_use_of_english: 180,
      writing: 180,
      listening: 180,
      speaking: null,
    };
    expect(overallScore(partial)).toBeNull();
  });

  it("averages all four skills equally when complete", () => {
    const complete = {
      reading_use_of_english: 160,
      writing: 180,
      listening: 200,
      speaking: 220,
    };
    expect(overallScore(complete)).toBe(190);
  });
});

describe("bandFor", () => {
  it("classifies scores into Cambridge bands", () => {
    expect(bandFor(CAMBRIDGE_SCALE.C2)).toBe("C2");
    expect(bandFor(CAMBRIDGE_SCALE.C1)).toBe("C1");
    expect(bandFor(CAMBRIDGE_SCALE.B2)).toBe("B2");
    expect(bandFor(CAMBRIDGE_SCALE.B2 - 1)).toBe("Below B2");
  });
});
