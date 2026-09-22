import { CAMBRIDGE_SCALE } from "@/lib/scoring/scale";
import type { Skill } from "@/lib/types/database";

export interface BadgeDef {
  id: string;
  label: string;
  description: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: "first_answer", label: "Primeiros passos", description: "Responda sua primeira questão" },
  { id: "streak_7", label: "Streak de 7 dias", description: "Pratique 7 dias seguidos" },
  { id: "streak_30", label: "Streak de 30 dias", description: "Pratique 30 dias seguidos" },
  { id: "reached_c1", label: "Nível C1", description: "Alcance nota C1 em alguma frente" },
  { id: "error_bank_cleared", label: "Banco de erros zerado", description: "Zere sua fila de revisão" },
  { id: "marathon_50", label: "Maratonista", description: "Responda 50 questões no total" },
];

export interface BadgeStats {
  totalAnswered: number;
  streak: number;
  bestScoreBySkill: Record<Skill, number | null>;
  reviewItemsTotal: number;
  reviewItemsDue: number;
}

export function computeEarnedBadgeIds(stats: BadgeStats): Set<string> {
  const earned = new Set<string>();

  if (stats.totalAnswered >= 1) earned.add("first_answer");
  if (stats.streak >= 7) earned.add("streak_7");
  if (stats.streak >= 30) earned.add("streak_30");
  if (Object.values(stats.bestScoreBySkill).some((s) => s != null && s >= CAMBRIDGE_SCALE.C1)) {
    earned.add("reached_c1");
  }
  if (stats.reviewItemsTotal > 0 && stats.reviewItemsDue === 0) earned.add("error_bank_cleared");
  if (stats.totalAnswered >= 50) earned.add("marathon_50");

  return earned;
}
