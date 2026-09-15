import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Server-only. Never import this module from a client component.
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return client;
}

// Flash is fast, good at structured/rubric-following tasks like grading,
// and has the most generous free tier — the right default for this app.
// Bump to "gemini-2.5-pro" later if grading quality needs it.
export const AGENT_MODEL = "gemini-2.5-flash";
