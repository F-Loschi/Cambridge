import { synthesizeSpeech, TtsQuotaExhaustedError } from "@/lib/agent/synthesizeSpeech";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "listening-audio";

/**
 * Generates and stores audio for every approved Listening question that
 * doesn't have it yet, saving the public URL in content.audioUrl.
 * Idempotent — safe to re-run after generating new questions.
 */
export async function backfillListeningAudio(log: (msg: string) => void = console.log) {
  const supabase = createAdminClient();

  const { data: questions, error } = await supabase
    .from("question_bank")
    .select("id, content")
    .eq("skill", "listening")
    .eq("status", "approved");
  if (error) throw new Error(error.message);

  const pending = (questions ?? []).filter((q) => {
    const c = q.content as { contextText?: unknown; audioUrl?: unknown };
    return typeof c.contextText === "string" && !c.audioUrl;
  });
  log(`${pending.length} listening question(s) without audio`);

  let done = 0;
  let failed = 0;
  for (const q of pending) {
    const content = q.content as { contextText: string };
    try {
      const wav = await synthesizeSpeech(content.contextText);
      const path = `${q.id}.wav`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, wav, { contentType: "audio/wav", upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: updateError } = await supabase
        .from("question_bank")
        .update({ content: { ...content, audioUrl: data.publicUrl } })
        .eq("id", q.id);
      if (updateError) throw new Error(updateError.message);

      done++;
      log(`audio ${done}/${pending.length} ok (${Math.round(wav.length / 1024)} KB)`);
    } catch (err) {
      if (err instanceof TtsQuotaExhaustedError) {
        log(`${err.message}. ${pending.length - done - failed} question(s) left — re-run npm run backfill-audio later.`);
        break;
      }
      failed++;
      log(`audio FAILED for ${q.id}: ${err instanceof Error ? err.message.slice(0, 160) : err}`);
    }
  }
  return { done, failed };
}
