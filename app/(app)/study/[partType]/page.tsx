import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Info, ListChecks, Lightbulb, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { findPartType } from "@/lib/agent/partTypeCatalog";
import { levelFor } from "@/lib/scoring/partStats";
import { fetchPartStats } from "@/lib/server/studyData";
import { findLesson } from "@/lib/study/lessons";
import { SKILL_META } from "@/lib/ui/skills";
import { PartLevelBadge } from "@/components/PartLevelBadge";
import { StudyExercises } from "@/components/StudyExercises";
import type { RunnerQuestion } from "@/components/QuestionRunner";

export default async function StudyPartPage({ params }: { params: Promise<{ partType: string }> }) {
  const { partType: partTypeId } = await params;
  const part = findPartType(partTypeId);
  const lesson = findLesson(partTypeId);
  if (!part || !lesson) notFound();

  const supabase = await createClient();
  const [stats, { data: exercises }] = await Promise.all([
    fetchPartStats(supabase),
    supabase
      .from("question_bank")
      .select("id, skill, part_type, content, correct_answer")
      .eq("part_type", partTypeId)
      .eq("training", true)
      .eq("status", "approved")
      .limit(10),
  ]);

  const meta = SKILL_META[part.skill];
  const Icon = meta.icon;
  const stat = stats[partTypeId];

  const section = (icon: React.ReactNode, title: string, children: React.ReactNode) => (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/study" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-extrabold">
        <Icon size={24} strokeWidth={2.25} style={{ color: meta.color }} />
        {lesson.title}
      </h1>
      <p className="mb-3 text-xs text-muted">{part.label}</p>
      <div className="mb-6">
        <PartLevelBadge level={levelFor(stat)} stat={stat} />
      </div>

      <div className="flex flex-col gap-4">
        {section(
          <Target size={16} className="text-brand" strokeWidth={2.5} />,
          "O que essa parte testa",
          <p className="text-sm">{lesson.whatItTests}</p>,
        )}

        {section(
          <Info size={16} className="text-brand" strokeWidth={2.5} />,
          "Como é na prova",
          <>
            <p className="text-sm">{lesson.inTheExam}</p>
            {lesson.inThisApp && (
              <p className="mt-3 rounded-2xl bg-background p-3 text-xs text-muted">
                <span className="font-bold">No app: </span>
                {lesson.inThisApp}
              </p>
            )}
          </>,
        )}

        {section(
          <ListChecks size={16} className="text-success" strokeWidth={2.5} />,
          "Como resolver",
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {lesson.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>,
        )}

        {section(
          <AlertTriangle size={16} className="text-danger" strokeWidth={2.5} />,
          "Armadilhas comuns",
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {lesson.pitfalls.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>,
        )}

        {section(
          <Lightbulb size={16} className="text-streak" strokeWidth={2.5} />,
          "Exemplo comentado",
          <div className="flex flex-col gap-3 text-sm">
            <p className="rounded-2xl bg-background p-3 font-bold">{lesson.example.question}</p>
            <p>
              <span className="font-extrabold text-success">Resposta: </span>
              {lesson.example.answer}
            </p>
            <p className="text-muted">{lesson.example.explanation}</p>
          </div>,
        )}

        <div className="mt-2">
          <h2 className="mb-3 text-sm font-extrabold">Exercícios guiados</h2>
          <StudyExercises questions={(exercises ?? []) as RunnerQuestion[]} partTypeId={partTypeId} />
        </div>
      </div>
    </div>
  );
}
