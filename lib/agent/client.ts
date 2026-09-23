import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Server-only. Never import this module from a client component.
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return client;
}

type GenerateContentParams = Parameters<GoogleGenAI["models"]["generateContent"]>[0];

/**
 * gemini-3.6-flash returns 503 "high demand" fairly often (observed live,
 * repeatedly, 2026-09-22) — worth a short backoff-retry before giving up,
 * since a retry a few seconds later frequently succeeds.
 */
export async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: GenerateContentParams,
  maxRetries = 2,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number } | undefined)?.status;
      const retryable = status === 503 || status === 429;
      if (!retryable || attempt === maxRetries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
  throw lastError;
}

// gemini-2.5-flash was retired for keys created after some cutoff (404 "no
// longer available to new users"). Its replacement, gemini-3.6-flash, turned
// out to have a free-tier cap of only 20 requests/DAY (confirmed live via a
// 429 RESOURCE_EXHAUSTED — "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
// limit 20 — 2026-09-22), unworkable for an app that does 2+ calls per
// question generated plus one per explanation/insight/correction. The "lite"
// tier is built for higher-volume free use and also skips extended thinking
// (faster, cheaper) — switched to it and confirmed structured JSON output
// still works. Re-check with
// `curl https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY`
// if this ever 404s again, since the model lineup moves fast.
export const AGENT_MODEL = "gemini-3.5-flash-lite";
