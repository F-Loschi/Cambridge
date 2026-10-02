import type { createClient } from "@/lib/supabase/server";
import { statsByPartType, type AnsweredItem, type PartStat } from "@/lib/scoring/partStats";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** The user's accuracy per part type, from every answered question so far. */
export async function fetchPartStats(supabase: SupabaseServerClient): Promise<Record<string, PartStat>> {
  // RLS already limits attempt_items to the signed-in user's own attempts.
  const { data } = await supabase
    .from("attempt_items")
    .select("correct, question_bank!inner(part_type)")
    .limit(1000);

  const items: AnsweredItem[] = (data ?? []).flatMap((row) => {
    const qb = row.question_bank as { part_type: string } | { part_type: string }[] | null;
    const partType = Array.isArray(qb) ? qb[0]?.part_type : qb?.part_type;
    return partType ? [{ correct: row.correct, partType }] : [];
  });
  return statsByPartType(items);
}

/** How many approved training exercises exist per part type. */
export async function fetchTrainingCounts(supabase: SupabaseServerClient): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("question_bank")
    .select("part_type")
    .eq("training", true)
    .eq("status", "approved");

  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.part_type] = (counts[row.part_type] ?? 0) + 1;
  return counts;
}
