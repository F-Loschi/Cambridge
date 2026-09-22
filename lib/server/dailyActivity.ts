import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Increments today's attempts_count (sessions) and questions_answered
 * (items graded), creating the row if needed.
 */
export async function bumpDailyActivity(
  supabase: SupabaseServerClient,
  userId: string,
  questionsAnswered = 0,
) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("daily_activity")
    .select("attempts_count, questions_answered")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_activity")
      .update({
        attempts_count: existing.attempts_count + 1,
        questions_answered: existing.questions_answered + questionsAnswered,
      })
      .eq("user_id", userId)
      .eq("activity_date", today);
  } else {
    await supabase.from("daily_activity").insert({
      user_id: userId,
      activity_date: today,
      attempts_count: 1,
      questions_answered: questionsAnswered,
    });
  }
}
