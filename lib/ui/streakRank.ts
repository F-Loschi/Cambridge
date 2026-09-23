export interface StreakRank {
  title: string;
  color: string;
}

// Same day-bracket pacing as the classic "streak rank" meme ladder (1, 2,
// 3-5, 6-10, 11-13, 14-15, 16-20, 21-23, then one per day up to 29, with a
// final permanent tier at 30) — reskinned around the C1 study journey
// instead of military rank, and ending on a wink at the original's
// "king -> monk" punchline (mastery isn't about power, it's about flow).
const RANKS: { minDays: number; title: string; color: string }[] = [
  { minDays: 0, title: "Pronto pra começar", color: "var(--muted)" },
  { minDays: 1, title: "Calouro", color: "var(--muted)" },
  { minDays: 2, title: "Aprendiz", color: "var(--color-bronze)" },
  { minDays: 3, title: "Leitor Dedicado", color: "var(--color-bronze)" },
  { minDays: 6, title: "Caçador de Vocabulário", color: "var(--color-silver)" },
  { minDays: 11, title: "Guardião da Gramática", color: "var(--color-silver)" },
  { minDays: 14, title: "Estrategista do Idioma", color: "var(--color-silver)" },
  { minDays: 16, title: "Fluente em Ascensão", color: "var(--color-gold)" },
  { minDays: 21, title: "Mestre das Collocations", color: "var(--color-gold)" },
  { minDays: 24, title: "Erudito Anglófono", color: "var(--color-teal)" },
  { minDays: 25, title: "Sábio do C1", color: "var(--color-teal)" },
  { minDays: 26, title: "Lenda Viva do Inglês", color: "var(--color-violet)" },
  { minDays: 27, title: "Imperador da Língua", color: "var(--color-violet)" },
  { minDays: 28, title: "Divindade Poliglota", color: "var(--color-violet)" },
  { minDays: 29, title: "Rei do Inglês", color: "var(--color-gold)" },
  { minDays: 30, title: "Iluminado", color: "var(--color-brand)" },
];

/** Highest rank whose threshold the streak has reached; stays at the day-30 rank forever after. */
export function rankForStreak(streak: number): StreakRank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (streak >= rank.minDays) current = rank;
    else break;
  }
  return { title: current.title, color: current.color };
}
