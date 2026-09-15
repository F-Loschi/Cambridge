import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/scoring/streak";
import { averageScoreBySkill, overallScore, bandFor } from "@/lib/scoring/scale";
import type { Skill } from "@/lib/types/database";

const SKILL_LABELS: Record<Skill, string> = {
  reading_use_of_english: "Reading & Use of English",
  writing: "Writing",
  listening: "Listening",
  speaking: "Speaking",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware already redirects unauthenticated users

  const [{ data: activity }, { data: attempts }] = await Promise.all([
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
  ]);

  const streak = computeStreak(activity ?? []);
  const bySkill = averageScoreBySkill(attempts ?? []);
  const overall = overallScore(bySkill);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Seu progresso</h1>

      <section className="mb-8 flex gap-6">
        <StatCard label="Streak" value={`${streak} dia${streak === 1 ? "" : "s"}`} />
        <StatCard
          label="Resultado geral"
          value={overall ? `${overall.toFixed(0)} (${bandFor(overall)})` : "—"}
          hint={overall ? undefined : "Complete pelo menos uma tentativa em cada frente"}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Desempenho por frente</h2>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(SKILL_LABELS) as Skill[]).map((skill) => {
            const score = bySkill[skill];
            return (
              <div key={skill} className="rounded border p-4">
                <p className="text-sm text-neutral-600">{SKILL_LABELS[skill]}</p>
                <p className="text-xl font-semibold">
                  {score ? `${score.toFixed(0)} (${bandFor(score)})` : "Sem dados"}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded border p-4">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
