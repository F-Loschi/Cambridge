import type { createClient } from "@/lib/supabase/server";
import { dueDateAfter, INITIAL_REVIEW_STATE, nextReviewState } from "@/lib/scoring/spacedRepetition";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Upserts review_items for the given results. Fresh (never-seen) question
 * ids get created with the initial SM-2 state; ones already in the queue
 * get their schedule advanced or reset based on nextReviewState.
 */
export async function updateReviewItems(
  supabase: SupabaseServerClient,
  userId: string,
  results: { question_id: string; correct: boolean }[],
) {
  if (results.length === 0) return;

  const questionIds = [...new Set(results.map((r) => r.question_id))];
  const { data: existingRows } = await supabase
    .from("review_items")
    .select("question_id, interval_days, ease, times_seen, times_correct")
    .eq("user_id", userId)
    .in("question_id", questionIds);

  const existingByQuestion = new Map((existingRows ?? []).map((r) => [r.question_id, r]));
  const now = new Date();

  // If a question appears more than once, only its last result matters.
  const lastResultByQuestion = new Map(results.map((r) => [r.question_id, r.correct]));

  const rows = [...lastResultByQuestion.entries()].map(([questionId, correct]) => {
    const existing = existingByQuestion.get(questionId);
    const next = nextReviewState(
      existing ? { intervalDays: existing.interval_days, ease: existing.ease } : INITIAL_REVIEW_STATE,
      correct,
    );
    return {
      user_id: userId,
      question_id: questionId,
      interval_days: next.intervalDays,
      ease: next.ease,
      due_at: dueDateAfter(next.intervalDays, now),
      times_seen: (existing?.times_seen ?? 0) + 1,
      times_correct: (existing?.times_correct ?? 0) + (correct ? 1 : 0),
      last_reviewed_at: now.toISOString(),
    };
  });

  await supabase.from("review_items").upsert(rows, { onConflict: "user_id,question_id" });
}
