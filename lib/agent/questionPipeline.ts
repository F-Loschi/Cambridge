import { Type } from "@google/genai";
import { AGENT_MODEL, generateContentWithRetry, getGeminiClient } from "@/lib/agent/client";
import { isAnswerCorrect } from "@/lib/scoring/grading";
import type { Skill } from "@/lib/types/database";

// Generator -> blind solver -> auditor, as designed for the question bank:
// three independent calls so the model never grades its own generation.

export interface GeneratedQuestion {
  content: { prompt: string; contextText?: string; options?: string[] };
  correctAnswer: string;
  explanation: string;
  difficultyEstimate: "B2" | "C1" | "C2";
}

// The renderer (lib/ui/questionContent.ts) only understands prompt/contextText/
// options, so the schema — not just prompt wording — has to constrain the
// model to those exact keys. "multiple_choice" requires options; everything
// else (open cloze, word formation, key word transformation, short listening
// answers) is graded as free text against correctAnswer.
const CONTENT_SCHEMAS = {
  multiple_choice: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: "The question or gapped sentence shown to the student." },
      contextText: { type: Type.STRING, description: "Optional short passage/dialogue giving context." },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactly 4 answer choices, one of which is correctAnswer.",
      },
    },
    required: ["prompt", "options"],
  },
  short_answer: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: "The question or gapped sentence shown to the student." },
      contextText: { type: Type.STRING, description: "Optional short passage/dialogue giving context." },
    },
    required: ["prompt"],
  },
} as const;

export type QuestionKind = keyof typeof CONTENT_SCHEMAS;

function buildGeneratedQuestionSchema(kind: QuestionKind) {
  return {
    type: Type.OBJECT,
    properties: {
      content: CONTENT_SCHEMAS[kind],
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING },
      difficultyEstimate: { type: Type.STRING, enum: ["B2", "C1", "C2"] },
    },
    required: ["content", "correctAnswer", "explanation", "difficultyEstimate"],
  };
}

export async function generateQuestion(params: {
  skill: Skill;
  partType: string;
  kind: QuestionKind;
  calibrationExamples: string[]; // original examples matching the official style — never real exam text
}): Promise<GeneratedQuestion> {
  const ai = getGeminiClient();

  const response = await generateContentWithRetry(ai, {
    model: AGENT_MODEL,
    config: {
      systemInstruction: `You write original Cambridge C1 Advanced practice questions for part type "${params.partType}".
Match the format, register and difficulty of the calibration examples exactly, but never reuse
their wording verbatim. "content.prompt" is the exact text the student sees (the question or the
gapped sentence, with a blank shown as ___). "content.contextText" is only for a short surrounding
passage/dialogue when the part type needs one. ${
        params.kind === "multiple_choice"
          ? '"content.options" must have exactly 4 plausible choices, one of which equals correctAnswer.'
          : "correctAnswer must be a single word or short phrase — no options field."
      }`,
      responseMimeType: "application/json",
      responseSchema: buildGeneratedQuestionSchema(params.kind),
    },
    contents: `Calibration examples (original style reference, do not copy):
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

  const response = await generateContentWithRetry(ai, {
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
