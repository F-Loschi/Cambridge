import Link from "next/link";
import { ChevronRight, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PART_TYPES } from "@/lib/agent/partTypeCatalog";
import { levelFor } from "@/lib/scoring/partStats";
import { fetchPartStats } from "@/lib/server/studyData";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";
import { PartLevelBadge } from "@/components/PartLevelBadge";
import { findLesson } from "@/lib/study/lessons";

export default async function StudyPage() {
  const supabase = await createClient();
  const stats = await fetchPartStats(supabase);

  const rows = PART_TYPES.map((part) => ({
    part,
    stat: stats[part.id],
    level: levelFor(stats[part.id]),
  }));
  const struggling = rows.filter((r) => r.level === "struggling");

  const card = (r: (typeof rows)[number]) => {
    const meta = SKILL_META[r.part.skill];
    const Icon = meta.icon;
    return (
      <Link
        key={r.part.id}
        href={`/study/${r.part.id}`}
        className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}
        >
          <Icon size={22} strokeWidth={2.25} style={{ color: meta.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{findLesson(r.part.id)?.title ?? r.part.label}</p>
          <p className="mb-1 truncate text-xs text-muted">{r.part.label}</p>
          <PartLevelBadge level={r.level} stat={r.stat} />
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted" />
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold">Estudar</h1>
      <p className="mb-6 text-sm text-muted">
        Teoria de cada parte da prova, com exercícios um pouco mais simples pra pegar o jeito.
      </p>

      {struggling.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-danger">
            <Target size={16} strokeWidth={2.5} /> Onde focar
          </h2>
          <div className="flex flex-col gap-3">{struggling.map(card)}</div>
        </section>
      )}

      {SKILL_ORDER.map((skill) => {
        const inSkill = rows.filter((r) => r.part.skill === skill);
        if (inSkill.length === 0) return null;
        return (
          <section key={skill} className="mb-8">
            <h2 className="mb-3 text-sm font-extrabold text-muted">{SKILL_META[skill].label}</h2>
            <div className="flex flex-col gap-3">{inSkill.map(card)}</div>
          </section>
        );
      })}
    </div>
  );
}
