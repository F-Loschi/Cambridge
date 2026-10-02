import type { Skill } from "@/lib/types/database";
import type { QuestionKind } from "@/lib/agent/questionPipeline";

export interface PartTypeDef {
  id: string;
  skill: Skill;
  label: string;
  kind: QuestionKind;
  calibrationExamples: string[];
  /** short_answer only: max words allowed in correctAnswer (format-check limit). Ignored for multiple_choice. */
  maxAnswerWords?: number;
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
    maxAnswerWords: 1,
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
    maxAnswerWords: 1,
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
    maxAnswerWords: 8,
    calibrationExamples: [
      `Prompt (exactly this layout, nothing else — no instructions, no "Answer:" line):
It's possible that the flight will be delayed because of the storm.
LIKELY
The flight ___ because of the storm.
Answer: is likely to be delayed
(Rules: the answer is only the words that fill the gap, 3-6 words, and must contain the keyword UNCHANGED. Read the second sentence with the answer put into the gap: it must be fully grammatical and mean the same as the original.)`,
      `Prompt:
"I wish I hadn't spent so much money," said Tom.
REGRETTED
Tom ___ so much money.
Answer: regretted spending
(A structure change — verb pattern -ing vs to-infinitive — gives exactly one correct answer.)`,
      `Prompt:
I can't tolerate his constant complaining any longer.
UP
I can't ___ his constant complaining any longer.
Answer: put up with
(A fixed phrasal verb, keyword unchanged: exactly one correct answer.)`,
      `Keyword choice (important): pick keywords that force ONE fixed phrase, phrasal verb, collocation or grammatical structure — e.g. LIKELY, REGRETTED, UP (put up with), SOONER (no sooner ... than), UNLESS, RATHER (would rather). Do NOT pick keywords where interchangeable adjectives or nouns could fill the gap: SURPRISE would accept "total", "complete" or "great" surprise, so a correct student answer would be marked wrong by exact matching. Never write an item where more than one natural answer exists, and never give an answer that omits the keyword. Vary the structure tested from item to item (passive, reported speech, wish/regret, causative, comparatives, phrasal verbs, inversion, conditionals, modal verbs) — do not fall back on the same one.`,
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
    id: "reading_part6_cross_text_matching",
    skill: "reading_use_of_english",
    label: "Reading Parte 6 — Cross-text multiple matching",
    kind: "multiple_choice",
    calibrationExamples: [
      `Passage (contextText — four short texts, each ~40-60 words, labelled A-D, all giving a differing personal opinion on the same topic, e.g. whether city life is better than rural life):
A) [opinion favouring city convenience but noting the expense]
B) [opinion favouring rural quiet but noting isolation]
C) [opinion that it depends entirely on career, not lifestyle]
D) [opinion favouring city life specifically for its cultural variety]
Question: Which writer expresses a different view from the others regarding what should determine where someone lives?
Options: A) Writer A  B) Writer B  C) Writer C  D) Writer D
Answer: C
(All four texts discuss the same topic from different angles; the question asks the reader to identify agreement/disagreement or a unique stance across texts — never a detail from a single text in isolation. Always use exactly four writer options, A-D.)`,
    ],
  },
  {
    id: "reading_part7_gapped_text",
    skill: "reading_use_of_english",
    label: "Reading Parte 7 — Gapped text",
    kind: "multiple_choice",
    calibrationExamples: [
      `Passage (contextText — a continuous article of several paragraphs with one paragraph removed and replaced by a gap marker, e.g. "[GAP]"): an article about the history of a small invention, written so that the paragraph before the gap ends on an unresolved point (e.g. "...but one obstacle remained unsolved for nearly a decade.") and the paragraph after the gap opens by referring back to something that must have been stated in the missing paragraph (e.g. "This breakthrough changed everything.").
Question: Which paragraph best fits the gap marked [GAP]?
Options: A) [a paragraph describing the eventual solution to the obstacle]  B) [a paragraph about an unrelated later event]  C) [a paragraph repeating information already given earlier]  D) [a paragraph that contradicts the article's timeline]
Answer: A
(The correct option must link logically to BOTH the paragraph immediately before and immediately after the gap — via a pronoun, a repeated idea, or a clear cause-effect connection. The other three options must each fail one of those links. Always use exactly four paragraph options, A-D.)`,
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
    maxAnswerWords: 3,
    calibrationExamples: [
      `Context (what the speaker says, as contextText): "...and the tour will begin promptly at the main entrance, so please arrive at least fifteen minutes early."
Gap sentence (prompt): Visitors should arrive at the main entrance ___ minutes before the tour starts.
Answer: fifteen
(The answer is always taken verbatim from what was "said" — no more than three words.)`,
    ],
  },
  {
    id: "listening_part3_multiple_choice",
    skill: "listening",
    label: "Listening Parte 3 — Multiple choice (interview)",
    kind: "multiple_choice",
    calibrationExamples: [
      `Context (contextText — a longer two-person interview, several exchanges, more nuanced than Part 1): An interviewer asks a travel writer about her latest book. She explains that, although she expected the research trips to be the hardest part of writing it, she actually found structuring the chapters afterward far more demanding, since the stories refused to fit a simple chronological order.
Question: What does the travel writer say was the most difficult aspect of writing the book?
Options: A) Finding time to travel.  B) Organising the material into chapters.  C) Remembering details from her trips.  D) Convincing her publisher of the concept.
Answer: B
(Unlike Part 1, the context should be long enough to require tracking an opinion that shifts or gets refined over the course of the exchange — the correct answer should not be obvious from the first sentence alone.)`,
    ],
  },
  {
    id: "listening_part4_multiple_matching",
    skill: "listening",
    label: "Listening Parte 4 — Multiple matching (opinion)",
    kind: "multiple_choice",
    calibrationExamples: [
      `Context (contextText — one short monologue, a single speaker giving a personal opinion on a topic, as if one of several similar speakers heard in sequence): "Everyone kept telling me working from home would be easier, but honestly I miss having people around to bounce ideas off. I get more done in terms of raw output, sure, but I think the quality of my ideas has actually gone down."
Question: What is the speaker's main point about working from home?
Options: A) It has improved the quality of her ideas.  B) It has made her less productive overall.  C) It has reduced the number of hours she works.  D) It has cost her valuable collaboration with others.
Answer: D
(Each item is one speaker's short, self-contained opinion — the question asks what that speaker's overall attitude or main point is, not a factual detail.)`,
    ],
  },
];

export function partTypesForSkill(skill: Skill): PartTypeDef[] {
  return PART_TYPES.filter((p) => p.skill === skill);
}

export function findPartType(id: string): PartTypeDef | undefined {
  return PART_TYPES.find((p) => p.id === id);
}
