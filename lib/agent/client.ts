import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Server-only. Never import this module from a client component.
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return client;
}

// gemini-2.5-flash was retired for keys created after some cutoff (404 "no
// longer available to new users" — found live, 2026-09-22). Verified this
// one actually responds against the real API; re-check with
// `curl https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY`
// if this ever 404s again, since the model lineup moves fast.
export const AGENT_MODEL = "gemini-3.6-flash";
