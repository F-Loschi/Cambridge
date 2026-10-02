import { generateContentWithRetry, getGeminiClient } from "@/lib/agent/client";
import { pcmToWav } from "@/lib/server/wav";

// A preview model — the TTS lineup moves fast (see the note in client.ts).
// Re-check with `curl .../v1beta/models?key=$GEMINI_API_KEY` if this 404s.
// Slow (~30s per call), so audio is generated ahead of time and stored,
// never on a student's request.
export const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const VOICES = ["Kore", "Charon", "Aoede", "Fenrir", "Puck", "Leda"];

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const ai = getGeminiClient();
  const voiceName = VOICES[Math.floor(Math.random() * VOICES.length)];

  const response = await generateContentWithRetry(ai, {
    model: TTS_MODEL,
    contents: [
      { parts: [{ text: `Say in a clear British accent, at a natural speaking pace:\n\n${text}` }] },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) throw new Error("TTS returned no audio");
  return pcmToWav(Buffer.from(data, "base64"));
}
