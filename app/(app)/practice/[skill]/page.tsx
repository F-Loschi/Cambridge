import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sprout } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types/database";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";
import { QuestionRunner, type RunnerQuestion } from "@/components/QuestionRunner";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  if (!SKILL_ORDER.includes(skill as Skill)) notFound();

  const meta = SKILL_META[skill as Skill];
  const Icon = meta.icon;
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("question_bank")
    .select("id, skill, part_type, content, correct_answer")
    .eq("skill", skill)
    .eq("status", "approved")
    .limit(10);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/practice"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <Icon size={24} strokeWidth={2.25} style={{ color: meta.color }} />
        {meta.label}
      </h1>

      {!questions || questions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border p-8 text-center">
          <Sprout size={32} className="text-success" strokeWidth={1.75} />
          <p className="text-sm text-muted">
            Ainda não há questões aprovadas para essa frente. Volte em breve.
          </p>
        </div>
      ) : (
        <QuestionRunner
          questions={questions as RunnerQuestion[]}
          submitUrl="/api/attempts/submit"
          onFinishHref="/practice"
        />
      )}
    </div>
  );
}
