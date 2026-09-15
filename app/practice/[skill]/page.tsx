import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types/database";

const VALID_SKILLS: Skill[] = [
  "reading_use_of_english",
  "writing",
  "listening",
  "speaking",
];

export default async function PracticePage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  if (!VALID_SKILLS.includes(skill as Skill)) notFound();

  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("question_bank")
    .select("id, part_type, content, difficulty_estimate")
    .eq("skill", skill)
    .eq("status", "approved")
    .limit(10);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold capitalize">
        {skill.replaceAll("_", " ")}
      </h1>
      {!questions || questions.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Ainda não há questões aprovadas para essa frente. Volte em breve.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {questions.map((q) => (
            <li key={q.id} className="rounded border p-4 text-sm">
              <p className="text-neutral-500">{q.part_type}</p>
              {/* TODO: renderer per part_type shape */}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
