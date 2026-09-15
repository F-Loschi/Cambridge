export interface QuestionContent {
  prompt?: string;
  contextText?: string;
  options?: string[];
}

/** question_bank.content is jsonb with a shape that varies by part_type — read it defensively. */
export function readQuestionContent(content: Record<string, unknown>): QuestionContent {
  const prompt = typeof content.prompt === "string" ? content.prompt : undefined;
  const contextText = typeof content.contextText === "string" ? content.contextText : undefined;
  const options =
    Array.isArray(content.options) && content.options.every((o) => typeof o === "string")
      ? (content.options as string[])
      : undefined;

  return { prompt, contextText, options };
}
