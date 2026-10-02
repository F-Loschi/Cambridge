export interface PartStat {
  correct: number;
  total: number;
}

export interface AnsweredItem {
  correct: boolean | null;
  partType: string;
}

// Below this many answers a percentage says little ("1 of 1 wrong" is not
// a weakness yet), so the part isn't classified.
export const MIN_ANSWERS_FOR_VERDICT = 5;
export const STRUGGLING_BELOW = 0.65;

export function statsByPartType(items: AnsweredItem[]): Record<string, PartStat> {
  const stats: Record<string, PartStat> = {};
  for (const item of items) {
    if (item.correct == null) continue;
    const stat = (stats[item.partType] ??= { correct: 0, total: 0 });
    stat.total += 1;
    if (item.correct) stat.correct += 1;
  }
  return stats;
}

export type PartLevel = "no_data" | "learning" | "struggling" | "solid";

export function levelFor(stat: PartStat | undefined): PartLevel {
  if (!stat || stat.total === 0) return "no_data";
  if (stat.total < MIN_ANSWERS_FOR_VERDICT) return "learning";
  return stat.correct / stat.total < STRUGGLING_BELOW ? "struggling" : "solid";
}
