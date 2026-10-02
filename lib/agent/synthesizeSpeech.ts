import { generateContentWithRetry, getGeminiClient } from "@/lib/agent/client";
import { pcmToWav } from "@/lib/server/wav";

// Preview models — the TTS lineup moves fast (see the note in client.ts).
// Re-check with `curl .../v1beta/models?key=$GEMINI_API_KEY` if one 404s.
// Each model has its own free-tier DAILY quota (the 2.5 one is only 10
// requests/day), so they are tried in order and the next is used when one
// is exhausted. Calls take ~30s, so audio is generated ahead of time and
// stored, never on a student's request.
export const TTS_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-3.8-flash-tts", "gemini-2.5-flash-preview-tts"];

const VOICES = ["Kore", "Charon", "Aoede", "Fenrir", "Puck", "Leda"];

export class TtsQuotaExhaustedError extends Error {
  constructor() {
    super("Every TTS model hit its free-tier quota — try again tomorrow");
  }
}

/** Gemini returns raw PCM ("audio/L16;rate=24000") from some models and a ready WAV from others. */
export function toWav(data: Buffer, mimeType: string | undefined): Buffer {
  if (mimeType?.toLowerCase().includes("wav")) return data;
  const rate = Number(mimeType?.match(/rate=(\d+)/i)?.[1] ?? 24000);
  return pcmToWav(data, rate);
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const ai = getGeminiClient();
  const voiceName = VOICES[Math.floor(Math.random() * VOICES.length)];
  let quotaHits = 0;
  let lastError: unknown;

  for (const model of TTS_MODELS) {
    try {
      const response = await generateContentWithRetry(
        ai,
        {
          model,
          contents: [
            { parts: [{ text: `Say in a clear British accent, at a natural speaking pace:\n\n${text}` }] },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
          },
        },
        0,
      );

      const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inline?.data) throw new Error(`${model} returned no audio`);
      return toWav(Buffer.from(inline.data, "base64"), inline.mimeType);
    } catch (err) {
      lastError = err;
      if ((err as { status?: number }).status === 429) quotaHits++;
    }
  }

  if (quotaHits === TTS_MODELS.length) throw new TtsQuotaExhaustedError();
  throw lastError;
}
