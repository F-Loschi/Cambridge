import type { DailyActivity } from "@/lib/types/database";

/**
 * Consecutive days of activity counting back from today, tolerating a gap
 * of "yesterday" so the streak doesn't reset the moment the clock rolls
 * over before the user has practiced today.
 */
export function computeStreak(activity: Pick<DailyActivity, "activity_date" | "attempts_count">[]): number {
  const activeDates = new Set(
    activity.filter((a) => a.attempts_count > 0).map((a) => a.activity_date),
  );

  if (activeDates.size === 0) return 0;

  const today = new Date();
  const cursor = new Date(today);

  // If today has no activity yet, start counting from yesterday instead
  // of breaking the streak outright.
  if (!activeDates.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (activeDates.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
