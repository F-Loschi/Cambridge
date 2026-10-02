/**
 * Chrome cuts off a single long utterance after ~15s, so listening
 * transcripts are spoken one sentence at a time.
 */
export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*["')\]]*\s*/g) ?? [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}

interface VoiceLike {
  name: string;
  lang: string;
}

/** Prefers a natural-sounding British English voice, then any English one. */
export function pickEnglishVoice<T extends VoiceLike>(voices: T[]): T | null {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (english.length === 0) return null;

  const score = (v: T) =>
    (/natural|neural|online/i.test(v.name) ? 4 : 0) +
    (/google/i.test(v.name) ? 2 : 0) +
    (v.lang.toLowerCase().replace("_", "-") === "en-gb" ? 3 : 0);

  return [...english].sort((a, b) => score(b) - score(a))[0];
}
