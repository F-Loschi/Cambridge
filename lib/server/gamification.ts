import type { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/scoring/streak";
import { MAX_STREAK_SHIELDS, shieldMilestonesEarned } from "@/lib/scoring/streakShields";
import { bumpDailyActivity } from "@/lib/server/dailyActivity";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function isoDaysAgo(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * If the user missed exactly one day (yesterday empty, the day before
 * active) and has a shield available, spend it to backfill yesterday so
 * the streak isn't broken. Only bridges a single-day gap — a longer gap
 * means the streak was already over regardless of shields.
 */
async function maybeConsumeStreakShield(supabase: SupabaseServerClient, userId: string) {
  const yesterday = isoDaysAgo(1);
  const dayBefore = isoDaysAgo(2);

  const { data: yesterdayRow } = await supabase
    .from("daily_activity")
    .select("attempts_count")
    .eq("user_id", userId)
    .eq("activity_date", yesterday)
    .maybeSingle();
  if (yesterdayRow && yesterdayRow.attempts_count > 0) return; // no gap

  const { data: dayBeforeRow } = await supabase
    .from("daily_activity")
    .select("attempts_count")
    .eq("user_id", userId)
    .eq("activity_date", dayBefore)
    .maybeSingle();
  if (!dayBeforeRow || dayBeforeRow.attempts_count === 0) return; // nothing active to protect

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_shields")
    .eq("id", userId)
    .single();
  if (!profile || profile.streak_shields <= 0) return;

  await supabase
    .from("daily_activity")
    .upsert(
      { user_id: userId, activity_date: yesterday, attempts_count: 1, questions_answered: 0 },
      { onConflict: "user_id,activity_date" },
    );
  await supabase
    .from("profiles")
    .update({ streak_shields: profile.streak_shields - 1 })
    .eq("id", userId);
}

/** Awards a shield (capped) whenever the streak crosses a new 7-day milestone. */
async function maybeAwardStreakShield(supabase: SupabaseServerClient, userId: string, streak: number) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_shields, last_shield_milestone")
    .eq("id", userId)
    .single();
  if (!profile) return;

  const earned = shieldMilestonesEarned(streak);
  if (earned <= profile.last_shield_milestone) return;

  await supabase
    .from("profiles")
    .update({
      streak_shields: Math.min(MAX_STREAK_SHIELDS, profile.streak_shields + (earned - profile.last_shield_milestone)),
      last_shield_milestone: earned,
    })
    .eq("id", userId);
}

/**
 * The one call every submission route makes: reconcile any shield-covered
 * gap, log today's activity, then check whether the streak just crossed a
 * milestone worth a new shield.
 */
export async function reconcileGamification(
  supabase: SupabaseServerClient,
  userId: string,
  questionsAnswered: number,
) {
  await maybeConsumeStreakShield(supabase, userId);
  await bumpDailyActivity(supabase, userId, questionsAnswered);

  const { data: activity } = await supabase
    .from("daily_activity")
    .select("activity_date, attempts_count")
    .eq("user_id", userId);
  const streak = computeStreak(activity ?? []);

  await maybeAwardStreakShield(supabase, userId, streak);
}
