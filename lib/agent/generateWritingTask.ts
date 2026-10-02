import { Type } from "@google/genai";
import { AGENT_MODEL, generateContentWithRetry, getGeminiClient } from "@/lib/agent/client";

export type WritingTaskType = "essay" | "letter_email" | "report" | "review" | "proposal";

export const WRITING_TASK_LABELS: Record<WritingTaskType, string> = {
  essay: "Redação (Parte 1 — obrigatória)",
  letter_email: "Carta / e-mail",
  report: "Relatório",
  review: "Resenha",
  proposal: "Proposta",
};

// C1 Advanced Writing tasks run 220-260 words; Part 1 is always an essay
// responding to a question with two given content points, Part 2 is a
// choice of genre-specific task. Calibration guidance only — never real
// exam content.
const TASK_GUIDANCE: Record<WritingTaskType, string> = {
  essay: `An essay responding to a discursive question, giving two contrasting content points the candidate must address (e.g. two opposing viewpoints or two factors), plus "your own ideas". Register: semi-formal/formal, balanced argument.`,
  letter_email: `A letter or email replying to a given situation (e.g. a complaint, a request, an invitation), with 2-3 specific points the candidate must cover. Register depends on context — can be formal or informal.`,
  report: `A report for a specific reader (e.g. a manager, a committee) describing/evaluating something and making recommendations, with 2-3 points to cover. Register: formal, organised under logical headings.`,
  review: `A review of a book, film, product, or experience for a specific publication, covering description, opinion and a recommendation. Register: engaging, semi-formal.`,
  proposal: `A proposal suggesting a course of action to a specific reader (e.g. a manager, a local council), with reasoning and recommendations, 2-3 points to cover. Register: formal, persuasive.`,
};

export interface WritingTask {
  prompt: string;
}

export async function generateWritingTask(taskType: WritingTaskType): Promise<WritingTask> {
  const ai = getGeminiClient();

  const response = await generateContentWithRetry(ai, {
    model: AGENT_MODEL,
    config: {
      systemInstruction: `You write original Cambridge C1 Advanced Writing task prompts. Match the
format, register and difficulty of real CAE Writing tasks, but the scenario itself must be
original — never reuse real exam content. The task type is "${taskType}": ${TASK_GUIDANCE[taskType]}
"prompt" is the exact text shown to the candidate: context/scenario, the specific points to
cover, and an explicit "Write your ${taskType === "essay" ? "essay" : "response"} in 220-260 words." instruction at the end.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { prompt: { type: Type.STRING } },
        required: ["prompt"],
      },
    },
    contents: `Generate one new, original Writing task of type "${taskType}".`,
  });

  if (!response.text) throw new Error("Agent returned no text content");
  return JSON.parse(response.text) as WritingTask;
}
