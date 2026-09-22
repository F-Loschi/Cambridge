import { Type } from "@google/genai";
import { AGENT_MODEL, getGeminiClient } from "@/lib/agent/client";

// Long-turn (monologue) Speaking practice — no interlocutor, so we grade on
// the three axes that don't require a conversation partner. Real CAE
// Speaking also scores Interactive Communication, which needs a dialogue.
export interface SpeakingFeedback {
  transcript: string;
  scores: {
    grammarVocabulary: number;
    discourseManagement: number;
    pronunciation: number;
  };
  overallOutOf15: number;
  strengths: string[];
  improvements: string[];
}

const SYSTEM_PROMPT = `You are a Cambridge C1 Advanced (CAE) Speaking examiner.
Listen to the candidate's recorded response to the given prompt. Transcribe
it, then grade Grammar & Vocabulary, Discourse Management, and Pronunciation
(0-5 each, using the audio itself for pronunciation/fluency — not just the
transcript). Be honest and specific, in Portuguese (pt-BR) for the written
feedback fields; the transcript itself stays in English (the candidate's own
words).`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    scores: {
      type: Type.OBJECT,
      properties: {
        grammarVocabulary: { type: Type.NUMBER },
        discourseManagement: { type: Type.NUMBER },
        pronunciation: { type: Type.NUMBER },
      },
      required: ["grammarVocabulary", "discourseManagement", "pronunciation"],
    },
    overallOutOf15: { type: Type.NUMBER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["transcript", "scores", "overallOutOf15", "strengths", "improvements"],
};

export async function gradeSpeaking(params: {
  promptText: string;
  audioBase64: string;
  mimeType: string;
}): Promise<SpeakingFeedback> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: AGENT_MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
    contents: [
      {
        role: "user",
        parts: [
          { text: `Speaking prompt given to the candidate: """${params.promptText}"""` },
          { inlineData: { mimeType: params.mimeType, data: params.audioBase64 } },
        ],
      },
    ],
  });

  if (!response.text) throw new Error("Agent returned no text content");
  return JSON.parse(response.text) as SpeakingFeedback;
}
