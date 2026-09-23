import { describe, expect, it } from "vitest";
import { checkQuestionFormat } from "./questionFormat";
import { findPartType } from "./partTypeCatalog";
import type { GeneratedQuestion } from "./questionPipeline";

const mc = findPartType("uoe_part1_multiple_choice_cloze")!;
const shortAnswer = findPartType("uoe_part2_open_cloze")!;
const keyWord = findPartType("uoe_part4_key_word_transformation")!;

function gen(overrides: Partial<GeneratedQuestion["content"]> & { correctAnswer?: string }): GeneratedQuestion {
  return {
    content: { prompt: "Choose the word: I ___ to school.", ...overrides },
    correctAnswer: overrides.correctAnswer ?? "went",
    explanation: "",
    difficultyEstimate: "C1",
  };
}

describe("checkQuestionFormat — multiple_choice", () => {
  it("passes with exactly 4 options including the correct answer", () => {
    const q = gen({ options: ["go", "went", "gone", "going"], correctAnswer: "went" });
    expect(checkQuestionFormat(mc, q)).toBe(true);
  });

  it("fails with fewer than 4 options", () => {
    const q = gen({ options: ["go", "went", "gone"], correctAnswer: "went" });
    expect(checkQuestionFormat(mc, q)).toBe(false);
  });

  it("fails when the correct answer isn't among the options", () => {
    const q = gen({ options: ["go", "gone", "going", "goes"], correctAnswer: "went" });
    expect(checkQuestionFormat(mc, q)).toBe(false);
  });
});

describe("checkQuestionFormat — short_answer", () => {
  it("passes with a single-word answer", () => {
    const q = gen({ correctAnswer: "since" });
    expect(checkQuestionFormat(shortAnswer, q)).toBe(true);
  });

  it("fails when the answer is a full sentence for a single-word part type", () => {
    const q = gen({ correctAnswer: "since the beginning of the year" });
    expect(checkQuestionFormat(shortAnswer, q)).toBe(false);
  });

  it("allows a short phrase for key word transformation", () => {
    const q = gen({ correctAnswer: "is likely to be delayed" });
    expect(checkQuestionFormat(keyWord, q)).toBe(true);
  });
});

describe("checkQuestionFormat — always required", () => {
  it("fails on an empty prompt or answer", () => {
    expect(checkQuestionFormat(shortAnswer, gen({ prompt: "", correctAnswer: "x" }))).toBe(false);
    expect(checkQuestionFormat(shortAnswer, gen({ correctAnswer: "" }))).toBe(false);
  });
});
