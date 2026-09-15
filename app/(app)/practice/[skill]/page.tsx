import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types/database";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  if (!SKILL_ORDER.includes(skill as Skill)) notFound();

  const meta = SKILL_META[skill as Skill];
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("question_bank")
    .select("id, part_type, content, difficulty_estimate")
    .eq("skill", skill)
    .eq("status", "approved")
    .limit(10);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/practice" className="mb-4 inline-block text-sm font-bold text-muted">
        ← Voltar
      </Link>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <span>{meta.emoji}</span> {meta.label}
      </h1>

      {!questions || questions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl">🌱</p>
          <p className="mt-2 text-sm text-muted">
            Ainda não há questões aprovadas para essa frente. Volte em breve.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className="rounded-2xl border border-border bg-surface p-4 text-sm shadow-sm"
            >
              <p className="mb-1 text-xs font-bold text-muted">
                Questão {i + 1} · {q.part_type}
              </p>
              {/* TODO: renderer per part_type shape */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
