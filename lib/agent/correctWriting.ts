import { Type } from "@google/genai";
import { AGENT_MODEL, getGeminiClient } from "@/lib/agent/client";

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
Language, each scored 0-5. Be honest and specific — do not inflate scores.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        content: { type: Type.NUMBER },
        communicativeAchievement: { type: Type.NUMBER },
        organisation: { type: Type.NUMBER },
        language: { type: Type.NUMBER },
      },
      required: ["content", "communicativeAchievement", "organisation", "language"],
    },
    overallOutOf20: { type: Type.NUMBER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    annotatedErrors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING },
          issue: { type: Type.STRING },
          suggestion: { type: Type.STRING },
        },
        required: ["quote", "issue", "suggestion"],
      },
    },
  },
  required: ["scores", "overallOutOf20", "strengths", "improvements", "annotatedErrors"],
};

export async function correctWriting(params: {
  taskPrompt: string;
  taskType: "essay" | "letter_email" | "report" | "review" | "proposal";
  candidateText: string;
}): Promise<WritingFeedback> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: AGENT_MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
    contents: `Task type: ${params.taskType}
Task prompt given to the candidate:
"""${params.taskPrompt}"""

Candidate's response:
"""${params.candidateText}"""`,
  });

  if (!response.text) {
    throw new Error("Agent returned no text content");
  }

  return JSON.parse(response.text) as WritingFeedback;
}
