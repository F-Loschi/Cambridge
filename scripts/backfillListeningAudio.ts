/**
 * Generate spoken audio (Gemini TTS) for approved Listening questions that
 * don't have any yet. Run after generating new Listening questions.
 *
 * Usage: npm run backfill-audio
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

import { backfillListeningAudio } from "../lib/server/listeningAudio";

backfillListeningAudio()
  .then(({ done, failed }) => console.log(`Done. generated=${done} failed=${failed}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
