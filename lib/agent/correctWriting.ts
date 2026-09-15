import { AGENT_MODEL, getAnthropicClient } from "@/lib/agent/client";

// C1 Advanced Writing is graded on these four criteria, 0-5 each.
export interface WritingFeedback {
  scores: {
    content: number;
    communicativeAchievement: number;
    organisation: number;
    language: number;
  };
  overallOutOf20: number;
  strengths: string[];
  improvements: string[];
  annotatedErrors: { quote: string; issue: string; suggestion: string }[];
}

const SYSTEM_PROMPT = `You are a Cambridge C1 Advanced (CAE) Writing examiner.
Grade the candidate's response strictly against the official CAE Writing
assessment scale: Content, Communicative Achievement, Organisation, and
Language, each scored 0-5. Be honest and specific — do not inflate scores.
Respond ONLY with JSON matching the requested schema, no prose outside it.`;

export async function correctWriting(params: {
  taskPrompt: string;
  taskType: "essay" | "letter_email" | "report" | "review" | "proposal";
  candidateText: string;
}): Promise<WritingFeedback> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Task type: ${params.taskType}
Task prompt given to the candidate:
"""${params.taskPrompt}"""

Candidate's response:
"""${params.candidateText}"""

Return JSON with this exact shape:
{
  "scores": { "content": number, "communicativeAchievement": number, "organisation": number, "language": number },
  "overallOutOf20": number,
  "strengths": string[],
  "improvements": string[],
  "annotatedErrors": [{ "quote": string, "issue": string, "suggestion": string }]
}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Agent returned no text content");
  }

  return JSON.parse(textBlock.text) as WritingFeedback;
}
