/**
 * Seed question_bank with Speaking prompts. Speaking is rubric-graded from
 * audio, so there's no answer to blind-solve or audit — prompts go in as
 * approved directly. SpeakingRecorder only needs content.prompt.
 *
 * Usage: npm run seed-speaking -- [count]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  let content: string;
  try {
    content = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  } catch {
    return;
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!(key in process.env)) process.env[key] = trimmed.slice(idx + 1).trim();
  }
}
loadEnvLocal();

import { Type } from "@google/genai";
import { AGENT_MODEL, generateContentWithRetry, getGeminiClient } from "../lib/agent/client";
import { createAdminClient } from "../lib/supabase/admin";

// The app records a single-speaker 1-2 minute monologue, so prompts mirror
// CAE Part 2 (long turn) and Part 4 (discussion), phrased for one speaker.
const PART_TYPES = {
  speaking_long_turn: `a "long turn" prompt: the candidate compares and contrasts two situations described in words ("Imagine two people: one ... the other ..."), then answers one reflective question about them`,
  speaking_discussion: `a "discussion" prompt: a thought-provoking opinion question on a broader social/lifestyle topic, inviting the candidate to give reasons and examples`,
} as const;

async function generatePrompts(partType: keyof typeof PART_TYPES, count: number): Promise<string[]> {
  const ai = getGeminiClient();
  const response = await generateContentWithRetry(ai, {
    model: AGENT_MODEL,
    config: {
      systemInstruction: `You write original Cambridge C1 Advanced Speaking practice prompts — never real exam content. Each prompt is ${PART_TYPES[partType]}. Address the candidate directly in English, self-contained text only (no photos/images), answerable in 1-2 minutes by one speaker. The candidate cannot see anything: never mention pictures, photos, images or "look at". Vary the topics widely.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { prompts: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["prompts"],
      },
    },
    contents: `Generate ${count} distinct prompts.`,
  });
  if (!response.text) throw new Error("Agent returned no text content");
  // The model sometimes ignores the "no images" instruction, so enforce it.
  return (JSON.parse(response.text) as { prompts: string[] }).prompts.filter(
    (p) => !/\b(pictures?|photos?|photographs?|images?)\b/i.test(p),
  );
}

async function main() {
  const countPerType = Number(process.argv[2] ?? 10);
  const supabase = createAdminClient();

  const { data: existing, error: readError } = await supabase
    .from("question_bank")
    .select("content")
    .eq("skill", "speaking");
  if (readError) throw new Error(readError.message);
  const seen = new Set((existing ?? []).map((r) => String((r.content as { prompt?: string }).prompt)));

  let inserted = 0;
  for (const partType of Object.keys(PART_TYPES) as (keyof typeof PART_TYPES)[]) {
    const prompts = (await generatePrompts(partType, countPerType)).filter((p) => p.trim() && !seen.has(p));
    if (prompts.length === 0) continue;

    const { error } = await supabase.from("question_bank").insert(
      prompts.map((prompt) => ({
        skill: "speaking",
        part_type: partType,
        content: { prompt },
        correct_answer: "open",
        difficulty_estimate: "C1",
        status: "approved",
        generator_model: AGENT_MODEL,
      })),
    );
    if (error) throw new Error(error.message);
    inserted += prompts.length;
    console.log(`${partType}: ${prompts.length} inserted`);
  }
  console.log(`Done. inserted=${inserted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
