import type { Skill } from "@/lib/types/database";
import type { QuestionKind } from "@/lib/agent/questionPipeline";

export interface PartTypeDef {
  id: string;
  skill: Skill;
  label: string;
  kind: QuestionKind;
  calibrationExamples: string[];
}

// Auto-generation only covers objectively-gradable part types — Writing and
// Speaking are graded on rubrics/audio, not answer matching, so they stay
// out of this pipeline (Speaking prompts are simple enough to add by hand
// via question_bank directly, as done during QA).
export const PART_TYPES: PartTypeDef[] = [
  {
    id: "uoe_part1_multiple_choice_cloze",
    skill: "reading_use_of_english",
    label: "UoE Parte 1 — Multiple-choice cloze",
    kind: "multiple_choice",
    calibrationExamples: [
      `Passage: Scientists have long tried to (0) ___ why some people are naturally more optimistic than others.
Options: A) explain  B) reveal  C) express  D) declare
Answer: A) explain
(Note: "explain why" is the natural collocation; the other options don't fit this pattern with "why".)`,
    ],
  },
  {
    id: "uoe_part2_open_cloze",
    skill: "reading_use_of_english",
    label: "UoE Parte 2 — Open cloze",
    kind: "short_answer",
    calibrationExamples: [
      `Sentence: The meeting has been postponed ___ next Friday due to a scheduling conflict.
Answer: until
(Tests preposition choice — "postponed until" is the correct collocation; no options are given.)`,
    ],
  },
  {
    id: "uoe_part3_word_formation",
    skill: "reading_use_of_english",
    label: "UoE Parte 3 — Word formation",
    kind: "short_answer",
    calibrationExamples: [
      `Sentence: The committee praised her for her ___ in handling the crisis. (DECISIVE)
Answer: decisiveness
(The root word DECISIVE must become the abstract noun "decisiveness" to fit grammatically. Always give the root word in capitals inside the prompt, in parentheses.)`,
    ],
  },
  {
    id: "uoe_part4_key_word_transformation",
    skill: "reading_use_of_english",
    label: "UoE Parte 4 — Key word transformation",
    kind: "short_answer",
    calibrationExamples: [
      `Original sentence: "It's possible that the flight will be delayed because of the storm."
Keyword: LIKELY
Answer: "The flight is likely to be delayed because of the storm."
(The prompt must show the original sentence and the keyword in capitals; the answer must use between 3 and 6 words including the keyword and keep the original meaning exactly.)`,
    ],
  },
  {
    id: "reading_part5_multiple_choice",
    skill: "reading_use_of_english",
    label: "Reading Parte 5 — Multiple choice",
    kind: "multiple_choice",
    calibrationExamples: [
      `Passage (short extract, ~80 words): a first-person narrative about someone hesitating before a big decision, without stating their emotions directly.
Question: What does the writer suggest about the narrator's state of mind in the second paragraph?
Options: A) She is filled with regret.  B) She feels a sense of relief.  C) She is anxious about the future.  D) She is indifferent to the outcome.
Answer: C
(The correct answer must be inferable only from close reading of the passage, never stated explicitly in it.)`,
    ],
  },
  {
    id: "listening_part1_multiple_choice",
    skill: "listening",
    label: "Listening Parte 1 — Multiple choice",
    kind: "multiple_choice",
    calibrationExamples: [
      `Context (what the speaker says, as contextText): A woman explains that she changed careers because, despite good pay, she felt unfulfilled in her old job.
Question: Why did the speaker change careers?
Options: A) She wanted higher pay.  B) She felt unsatisfied with her job.  C) She was made redundant.  D) She wanted to work fewer hours.
Answer: B`,
    ],
  },
  {
    id: "listening_part2_sentence_completion",
    skill: "listening",
    label: "Listening Parte 2 — Sentence completion",
    kind: "short_answer",
    calibrationExamples: [
      `Context (what the speaker says, as contextText): "...and the tour will begin promptly at the main entrance, so please arrive at least fifteen minutes early."
Gap sentence (prompt): Visitors should arrive at the main entrance ___ minutes before the tour starts.
Answer: fifteen
(The answer is always one word or a short number/phrase, taken from what was "said".)`,
    ],
  },
];

export function partTypesForSkill(skill: Skill): PartTypeDef[] {
  return PART_TYPES.filter((p) => p.skill === skill);
}

export function findPartType(id: string): PartTypeDef | undefined {
  return PART_TYPES.find((p) => p.id === id);
}
