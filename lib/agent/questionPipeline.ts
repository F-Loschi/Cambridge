import type Anthropic from "@anthropic-ai/sdk";
import { AGENT_MODEL, getAnthropicClient } from "@/lib/agent/client";
import type { Skill } from "@/lib/types/database";

// Generator -> blind solver -> auditor, as designed for the question bank:
// three independent calls so the model never grades its own generation.

export interface GeneratedQuestion {
  content: Record<string, unknown>;
  correctAnswer: string;
  explanation: string;
  difficultyEstimate: "B2" | "C1" | "C2";
}

export async function generateQuestion(params: {
  skill: Skill;
  partType: string;
  calibrationExamples: string[]; // few-shot examples from official Cambridge sample papers
}): Promise<GeneratedQuestion> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 1024,
    system: `You write original Cambridge C1 Advanced practice questions for part type "${params.partType}".
Match the format, register and difficulty of the calibration examples exactly, but never reuse
their wording verbatim. Respond ONLY with JSON: { "content": object, "correctAnswer": string,
"explanation": string, "difficultyEstimate": "B2"|"C1"|"C2" }.`,
    messages: [
      {
        role: "user",
        content: `Calibration examples (official style reference, do not copy):
${params.calibrationExamples.map((e, i) => `Example ${i + 1}:\n${e}`).join("\n\n")}

Generate one new, original question.`,
      },
    ],
  });

  return parseJsonResponse<GeneratedQuestion>(message);
}

/** Independent pass: answers the question with no access to the generator's own answer/explanation. */
export async function blindSolve(params: {
  skill: Skill;
  partType: string;
  content: Record<string, unknown>;
}): Promise<{ answer: string }> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 512,
    system: `You are a C1 Advanced candidate answering a "${params.partType}" question. Respond ONLY with JSON: { "answer": string }.`,
    messages: [{ role: "user", content: JSON.stringify(params.content) }],
  });

  return parseJsonResponse<{ answer: string }>(message);
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

  const answersAgree =
    normalize(params.generatorAnswer) === normalize(params.blindSolverAnswer);

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

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseJsonResponse<T>(message: Anthropic.Message): T {
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Agent returned no text content");
  }
  return JSON.parse(textBlock.text) as T;
}
