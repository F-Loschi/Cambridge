import Link from "next/link";
import { ChevronRight, Languages, Target, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PART_TYPES } from "@/lib/agent/partTypeCatalog";
import { levelFor, type PartLevel, type PartStat } from "@/lib/scoring/partStats";
import { fetchPartStats } from "@/lib/server/studyData";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";
import { PartLevelBadge } from "@/components/PartLevelBadge";
import { findLesson } from "@/lib/study/lessons";
import { TOPICS, topicExerciseId } from "@/lib/study/topics";

interface Entry {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  stat: PartStat | undefined;
  level: PartLevel;
}

function EntryCard({ entry }: { entry: Entry }) {
  const Icon = entry.icon;
  return (
    <Link
      href={entry.href}
      className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `color-mix(in srgb, ${entry.color} 15%, transparent)` }}
      >
        <Icon size={22} strokeWidth={2.25} style={{ color: entry.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold">{entry.title}</p>
        <p className="mb-1 truncate text-xs text-muted">{entry.subtitle}</p>
        <PartLevelBadge level={entry.level} stat={entry.stat} />
      </div>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </Link>
  );
}

export default async function StudyPage() {
  const supabase = await createClient();
  const stats = await fetchPartStats(supabase);

  const partEntries: (Entry & { skill: (typeof PART_TYPES)[number]["skill"] })[] = PART_TYPES.map((part) => {
    const meta = SKILL_META[part.skill];
    return {
      key: part.id,
      href: `/study/${part.id}`,
      title: findLesson(part.id)?.title ?? part.label,
      subtitle: part.label,
      icon: meta.icon,
      color: meta.color,
      skill: part.skill,
      stat: stats[part.id],
      level: levelFor(stats[part.id]),
    };
  });

  const topicEntries: Entry[] = TOPICS.map((topic) => {
    const stat = stats[topicExerciseId(topic.id)];
    return {
      key: topic.id,
      href: `/study/topics/${topic.id}`,
      title: topic.title,
      subtitle: topic.tagline,
      icon: Languages,
      color: "var(--color-violet)",
      stat,
      level: levelFor(stat),
    };
  });

  const struggling = [...topicEntries, ...partEntries].filter((e) => e.level === "struggling");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold">Estudar</h1>
      <p className="mb-6 text-sm text-muted">
        Teoria com exemplos e exercícios um pouco mais simples, por assunto de língua e por parte da prova.
      </p>

      {struggling.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-danger">
            <Target size={16} strokeWidth={2.5} /> Onde focar
          </h2>
          <div className="flex flex-col gap-3">
            {struggling.map((e) => (
              <EntryCard key={e.key} entry={e} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-1 text-sm font-extrabold text-muted">Assuntos de língua</h2>
        <p className="mb-3 text-xs text-muted">Colocações, phrasal verbs, gramática: como funciona e como praticar.</p>
        <div className="flex flex-col gap-3">
          {topicEntries.map((e) => (
            <EntryCard key={e.key} entry={e} />
          ))}
        </div>
      </section>

      <h2 className="mb-3 text-sm font-extrabold text-muted">Partes da prova</h2>
      {SKILL_ORDER.map((skill) => {
        const inSkill = partEntries.filter((e) => e.skill === skill);
        if (inSkill.length === 0) return null;
        return (
          <section key={skill} className="mb-8">
            <h3 className="mb-3 text-xs font-bold text-muted">{SKILL_META[skill].label}</h3>
            <div className="flex flex-col gap-3">
              {inSkill.map((e) => (
                <EntryCard key={e.key} entry={e} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
