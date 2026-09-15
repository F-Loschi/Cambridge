import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/scoring/streak";
import { averageScoreBySkill, overallScore, bandFor, CAMBRIDGE_SCALE } from "@/lib/scoring/scale";
import { StreakFlame } from "@/components/StreakFlame";
import { SkillRing } from "@/components/SkillRing";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";

function toRingPercent(score: number | null): number {
  if (score == null) return 0;
  return (
    ((score - CAMBRIDGE_SCALE.min) / (CAMBRIDGE_SCALE.max - CAMBRIDGE_SCALE.min)) * 100
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // proxy.ts already redirects unauthenticated users

  const [{ data: activity }, { data: attempts }, { data: profile }] = await Promise.all([
    supabase
      .from("daily_activity")
      .select("activity_date, attempts_count")
      .eq("user_id", user.id),
    supabase
      .from("attempts")
      .select("skill, scaled_score, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(100),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  const streak = computeStreak(activity ?? []);
  const bySkill = averageScoreBySkill(attempts ?? []);
  const overall = overallScore(bySkill);
  const firstName =
    profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "por aí";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold">Olá, {firstName}!</h1>

      <section className="mb-8 grid grid-cols-2 gap-4">
        <div className="animate-pop rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-muted">Streak</p>
          <StreakFlame streak={streak} />
          <p className="mt-1 text-xs text-muted">
            {streak === 0
              ? "Pratique hoje pra começar sua sequência!"
              : "dias seguidos praticando"}
          </p>
        </div>

        <div className="animate-pop rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-muted">Resultado geral</p>
          {overall ? (
            <>
              <p className="font-display text-4xl font-extrabold text-brand">
                {overall.toFixed(0)}
              </p>
              <span className="mt-1 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                Nível {bandFor(overall)}
              </span>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Complete pelo menos 1 tentativa em cada frente pra desbloquear
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-extrabold">Desempenho por frente</h2>
        <div className="grid grid-cols-2 gap-4">
          {SKILL_ORDER.map((skill) => {
            const meta = SKILL_META[skill];
            const score = bySkill[skill];
            const Icon = meta.icon;
            return (
              <Link
                key={skill}
                href={`/practice/${skill}`}
                className="animate-pop flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface p-4 text-center shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <SkillRing percent={toRingPercent(score)} color={meta.color}>
                  <Icon size={26} strokeWidth={2.25} style={{ color: meta.color }} />
                </SkillRing>
                <p className="text-sm font-bold">{meta.short}</p>
                <p className="text-xs text-muted">
                  {score ? `${score.toFixed(0)} · ${bandFor(score)}` : "Sem dados"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
