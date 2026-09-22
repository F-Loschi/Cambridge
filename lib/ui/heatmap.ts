export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * `weeksCount` columns of 7 consecutive days each, ending today (no
 * calendar-week alignment needed — each row index still lands on a fixed
 * weekday throughout since columns are always exactly 7 days apart).
 */
export function buildHeatmapWeeks(
  activity: { activity_date: string; questions_answered: number }[],
  weeksCount = 12,
  today: Date = new Date(),
): HeatmapDay[][] {
  const countByDate = new Map(activity.map((a) => [a.activity_date, a.questions_answered]));
  const totalDays = weeksCount * 7;

  const start = new Date(`${toISODate(today)}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - totalDays + 1);

  const days: HeatmapDay[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    const iso = toISODate(cursor);
    days.push({ date: iso, count: countByDate.get(iso) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export function intensityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}
