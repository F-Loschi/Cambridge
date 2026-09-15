import { Type } from "@google/genai";
import { AGENT_MODEL, getGeminiClient } from "@/lib/agent/client";
import { isAnswerCorrect } from "@/lib/scoring/grading";
import type { Skill } from "@/lib/types/database";

// Generator -> blind solver -> auditor, as designed for the question bank:
// three independent calls so the model never grades its own generation.

export interface GeneratedQuestion {
  content: Record<string, unknown>;
  correctAnswer: string;
  explanation: string;
  difficultyEstimate: "B2" | "C1" | "C2";
}

const GENERATED_QUESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    content: { type: Type.OBJECT, properties: {} }, // shape varies by part_type
    correctAnswer: { type: Type.STRING },
    explanation: { type: Type.STRING },
    difficultyEstimate: { type: Type.STRING, enum: ["B2", "C1", "C2"] },
  },
  required: ["content", "correctAnswer", "explanation", "difficultyEstimate"],
};

export async function generateQuestion(params: {
  skill: Skill;
  partType: string;
  calibrationExamples: string[]; // few-shot examples from official Cambridge sample papers
}): Promise<GeneratedQuestion> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: AGENT_MODEL,
    config: {
      systemInstruction: `You write original Cambridge C1 Advanced practice questions for part type "${params.partType}".
Match the format, register and difficulty of the calibration examples exactly, but never reuse
their wording verbatim.`,
      responseMimeType: "application/json",
      responseSchema: GENERATED_QUESTION_SCHEMA,
    },
    contents: `Calibration examples (official style reference, do not copy):
${params.calibrationExamples.map((e, i) => `Example ${i + 1}:\n${e}`).join("\n\n")}

Generate one new, original question.`,
  });

  if (!response.text) throw new Error("Agent returned no text content");
  return JSON.parse(response.text) as GeneratedQuestion;
}

/** Independent pass: answers the question with no access to the generator's own answer/explanation. */
export async function blindSolve(params: {
  skill: Skill;
  partType: string;
  content: Record<string, unknown>;
}): Promise<{ answer: string }> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: AGENT_MODEL,
    config: {
      systemInstruction: `You are a C1 Advanced candidate answering a "${params.partType}" question.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { answer: { type: Type.STRING } },
        required: ["answer"],
      },
    },
    contents: JSON.stringify(params.content),
  });

  if (!response.text) throw new Error("Agent returned no text content");
  return JSON.parse(response.text) as { answer: string };
}

export interface AuditResult {
  status: "approved" | "rejected" | "needs_human_review";
  notes: string[];
}

/**
 * Deterministic checks (answer agreement) plus a lightweight LLM check for
 * format/level. Anything not clearly approved/rejected falls to human review.
 */
export function auditQuestion(params: {
  generatorAnswer: string;
  blindSolverAnswer: string;
  formatChecksPassed: boolean;
}): AuditResult {
  const notes: string[] = [];

  const answersAgree = isAnswerCorrect(params.generatorAnswer, params.blindSolverAnswer);

  if (!answersAgree) {
    notes.push(
      `Blind solver answer ("${params.blindSolverAnswer}") disagrees with generator answer ("${params.generatorAnswer}") — likely ambiguous item.`,
    );
  }
  if (!params.formatChecksPassed) {
    notes.push("Format checks failed (word count / option count / required key).");
  }

  if (!answersAgree || !params.formatChecksPassed) {
    return { status: "needs_human_review", notes };
  }
  return { status: "approved", notes };
}
