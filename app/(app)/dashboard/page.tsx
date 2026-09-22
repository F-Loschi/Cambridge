import Link from "next/link";
import { Award, CalendarClock, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/scoring/streak";
import {
  averageScoreBySkill,
  bandFor,
  bestScoreBySkill,
  CAMBRIDGE_SCALE,
  overallScore,
} from "@/lib/scoring/scale";
import { daysUntilExam } from "@/lib/scoring/examCountdown";
import { BADGE_DEFS, computeEarnedBadgeIds } from "@/lib/scoring/badges";
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

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: activity }, { data: attempts }, { data: profile }, { count: reviewTotal }, { count: reviewDue }] =
    await Promise.all([
      supabase
        .from("daily_activity")
        .select("activity_date, attempts_count, questions_answered")
        .eq("user_id", user.id),
      supabase
        .from("attempts")
        .select("skill, scaled_score, started_at")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(100),
      supabase
        .from("profiles")
        .select("full_name, exam_date, streak_shields, daily_goal_questions")
        .eq("id", user.id)
        .single(),
      supabase
        .from("review_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("review_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("due_at", today),
    ]);

  const streak = computeStreak(activity ?? []);
  const bySkill = averageScoreBySkill(attempts ?? []);
  const overall = overallScore(bySkill);
  const firstName =
    profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "por aí";
  const examDays = daysUntilExam(profile?.exam_date ?? null);

  const dailyGoal = profile?.daily_goal_questions ?? 5;
  const todayQuestions = (activity ?? []).find((a) => a.activity_date === today)?.questions_answered ?? 0;
  const goalPercent = Math.min(100, (todayQuestions / dailyGoal) * 100);
  const shields = profile?.streak_shields ?? 0;

  const totalAnswered = (activity ?? []).reduce((sum, a) => sum + a.questions_answered, 0);
  const earnedBadges = computeEarnedBadgeIds({
    totalAnswered,
    streak,
    bestScoreBySkill: bestScoreBySkill(attempts ?? []),
    reviewItemsTotal: reviewTotal ?? 0,
    reviewItemsDue: reviewDue ?? 0,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold">Olá, {firstName}!</h1>

      <Link
        href="/profile"
        className="animate-pop mb-6 flex items-center gap-3 rounded-3xl border border-border bg-surface p-4 shadow-sm transition-transform hover:-translate-y-0.5"
      >
        <CalendarClock size={22} className="shrink-0 text-brand" strokeWidth={2.25} />
        {examDays == null ? (
          <p className="text-sm font-bold text-muted">
            Defina a data do seu exame no perfil pra acompanhar a contagem regressiva
          </p>
        ) : examDays > 0 ? (
          <p className="text-sm font-bold">
            Faltam <span className="text-brand">{examDays}</span> dia{examDays === 1 ? "" : "s"} pro seu exame
          </p>
        ) : examDays === 0 ? (
          <p className="text-sm font-bold text-streak">É hoje! Boa sorte no exame.</p>
        ) : (
          <p className="text-sm font-bold text-muted">
            Sua data de exame já passou — atualize no perfil
          </p>
        )}
      </Link>

      <section className="mb-8 grid grid-cols-2 gap-4">
        <div className="animate-pop rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-bold text-muted">Streak</p>
            {shields > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-teal">
                <Shield size={13} strokeWidth={2.5} />×{shields}
              </span>
            )}
          </div>
          <StreakFlame streak={streak} />

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted">
              <span>Meta de hoje</span>
              <span>
                {todayQuestions}/{dailyGoal}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
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

      <section className="mb-8">
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

      <section>
        <h2 className="mb-4 text-lg font-extrabold">Conquistas</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGE_DEFS.map((badge) => {
            const earned = earnedBadges.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center ${
                  earned ? "border-brand bg-brand/10" : "border-border bg-surface opacity-60"
                }`}
              >
                <Award
                  size={22}
                  strokeWidth={2.25}
                  className={earned ? "text-brand" : "text-muted"}
                />
                <p className="text-xs font-bold">{badge.label}</p>
                <p className="text-[10px] text-muted">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
