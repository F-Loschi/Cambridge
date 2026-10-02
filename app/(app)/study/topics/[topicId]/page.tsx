import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, BookOpen, Info, Languages, ListChecks, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { levelFor } from "@/lib/scoring/partStats";
import { fetchPartStats } from "@/lib/server/studyData";
import { findTopic, topicExerciseId } from "@/lib/study/topics";
import { PartLevelBadge } from "@/components/PartLevelBadge";
import { StudyExercises } from "@/components/StudyExercises";
import type { RunnerQuestion } from "@/components/QuestionRunner";

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = findTopic(topicId);
  if (!topic) notFound();

  const exerciseId = topicExerciseId(topic.id);
  const supabase = await createClient();
  const [stats, { data: exercises }] = await Promise.all([
    fetchPartStats(supabase),
    supabase
      .from("question_bank")
      .select("id, skill, part_type, content, correct_answer")
      .eq("part_type", exerciseId)
      .eq("training", true)
      .eq("status", "approved")
      .limit(10),
  ]);
  const stat = stats[exerciseId];

  const card = (icon: React.ReactNode, title: string, children: React.ReactNode) => (
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
        <Languages size={24} strokeWidth={2.25} className="text-violet" />
        {topic.title}
      </h1>
      <p className="mb-3 text-sm text-muted">{topic.tagline}</p>
      <div className="mb-6">
        <PartLevelBadge level={levelFor(stat)} stat={stat} />
      </div>

      <div className="flex flex-col gap-4">
        {card(
          <BookOpen size={16} className="text-brand" strokeWidth={2.5} />,
          "Como funciona",
          <div className="space-y-3 text-sm">
            {topic.concept.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>,
        )}

        {topic.groups.map((group) => (
          <Fragment key={group.title}>
            {card(
            <Quote size={16} className="text-violet" strokeWidth={2.5} />,
            group.title,
            <>
              {group.intro && <p className="mb-3 text-sm text-muted">{group.intro}</p>}
              <ul className="flex flex-col gap-3">
                {group.examples.map((ex, i) => (
                  <li key={i} className="rounded-2xl bg-background p-3 text-sm">
                    <p className="font-bold">{ex.en}</p>
                    <p className="mt-1 text-muted">{ex.note}</p>
                  </li>
                ))}
              </ul>
            </>,
            )}
          </Fragment>
        ))}

        {card(
          <ListChecks size={16} className="text-success" strokeWidth={2.5} />,
          "Como estudar",
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {topic.howToStudy.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>,
        )}

        {card(
          <AlertTriangle size={16} className="text-danger" strokeWidth={2.5} />,
          "Erros comuns",
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {topic.pitfalls.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>,
        )}

        {card(
          <Info size={16} className="text-brand" strokeWidth={2.5} />,
          "Onde cai na prova",
          <p className="text-sm">{topic.inTheExam}</p>,
        )}

        <div className="mt-2">
          <h2 className="mb-3 text-sm font-extrabold">Exercícios</h2>
          <StudyExercises
            questions={(exercises ?? []) as RunnerQuestion[]}
            returnHref={`/study/topics/${topic.id}`}
          />
        </div>
      </div>
    </div>
  );
}
