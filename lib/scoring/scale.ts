import type { Attempt, Skill } from "@/lib/types/database";

// C1 Advanced (CAE) reference points on the Cambridge English Scale.
// Real boundaries vary slightly per session; these are the published
// nominal ranges, good enough for progress tracking (not a real grade).
export const CAMBRIDGE_SCALE = {
  min: 142,
  max: 210,
  B2: 160,
  C1: 180,
  C2: 200,
} as const;

const ALL_SKILLS: Skill[] = [
  "reading_use_of_english",
  "writing",
  "listening",
  "speaking",
];

/** Average scaled_score per skill from the user's most recent attempts. */
export function averageScoreBySkill(
  attempts: Pick<Attempt, "skill" | "scaled_score" | "started_at">[],
): Record<Skill, number | null> {
  const bySkill = Object.fromEntries(ALL_SKILLS.map((s) => [s, [] as number[]])) as Record<Skill, number[]>;

  for (const attempt of attempts) {
    if (attempt.scaled_score != null) {
      bySkill[attempt.skill].push(attempt.scaled_score);
    }
  }

  return Object.fromEntries(
    ALL_SKILLS.map((skill) => [
      skill,
      bySkill[skill].length
        ? bySkill[skill].reduce((sum, v) => sum + v, 0) / bySkill[skill].length
        : null,
    ]),
  ) as Record<Skill, number | null>;
}

/**
 * Cambridge weighs all four papers equally (25% each). Overall score is
 * only computed once every skill has at least one attempt — a partial
 * average would be misleading on the dashboard.
 */
export function overallScore(bySkill: Record<Skill, number | null>): number | null {
  const values = ALL_SKILLS.map((s) => bySkill[s]);
  if (values.some((v) => v == null)) return null;
  return (values as number[]).reduce((sum, v) => sum + v, 0) / values.length;
}

export function bandFor(score: number): "Below B2" | "B2" | "C1" | "C2" {
  if (score >= CAMBRIDGE_SCALE.C2) return "C2";
  if (score >= CAMBRIDGE_SCALE.C1) return "C1";
  if (score >= CAMBRIDGE_SCALE.B2) return "B2";
  return "Below B2";
}
