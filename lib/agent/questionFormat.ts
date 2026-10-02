import { isAnswerCorrect } from "@/lib/scoring/grading";
import type { PartTypeDef } from "@/lib/agent/partTypeCatalog";
import type { GeneratedQuestion } from "@/lib/agent/questionPipeline";

/**
 * Deterministic shape checks per part-type kind — separate from the
 * blind-solver answer-agreement check in auditQuestion. Catches malformed
 * generations (missing options, an answer that's actually a full sentence
 * where a single word was expected) before they ever reach a human.
 */
export function checkQuestionFormat(def: PartTypeDef, generated: GeneratedQuestion): boolean {
  const prompt = generated.content.prompt?.trim();
  const correctAnswer = generated.correctAnswer?.trim();
  if (!prompt || !correctAnswer) return false;

  if (def.kind === "multiple_choice") {
    const options = generated.content.options;
    if (!Array.isArray(options) || options.length !== 4) return false;
    if (!options.every((o) => typeof o === "string" && o.trim().length > 0)) return false;
    return options.some((o) => isAnswerCorrect(o, correctAnswer));
  }

  // short_answer: each part type declares its own answer-length ceiling
  // (open cloze/word formation are single words, listening gap-fill allows
  // up to three per the real exam's "no more than three words" instruction,
  // key word transformation allows a short phrase).
  const wordCount = correctAnswer.split(/\s+/).length;
  if (wordCount > (def.maxAnswerWords ?? 1)) return false;
  return def.requiresRootWord ? answerDerivesFromRoot(prompt, correctAnswer) : true;
}

/**
 * Word formation items show the root in capitals in parentheses, e.g.
 * "(DECISIVE)". Generators sometimes omit it (leaving a gap with several
 * valid answers) or answer with the root itself; both are rejected here.
 */
export function answerDerivesFromRoot(prompt: string, answer: string): boolean {
  const root = prompt.match(/\(([A-Z][A-Z\s-]{2,})\)/)?.[1].trim().toLowerCase();
  if (!root) return false;

  const normalized = answer.trim().toLowerCase();
  if (normalized === root) return false;

  // A derived word keeps (most of) the root: "happy" -> "happiness" still shares "happ".
  const stem = root.slice(0, Math.max(3, Math.min(4, root.length - 1)));
  return normalized.includes(stem);
}
