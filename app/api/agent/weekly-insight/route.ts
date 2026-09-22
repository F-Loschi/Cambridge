import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyInsight, type ErrorBreakdownEntry } from "@/lib/agent/weeklyInsight";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: attempts } = await supabase
    .from("attempts")
    .select("id, skill")
    .eq("user_id", user.id)
    .gte("started_at", sevenDaysAgo.toISOString());

  const attemptIds = (attempts ?? []).map((a) => a.id);
  const skillByAttempt = new Map((attempts ?? []).map((a) => [a.id, a.skill]));

  const { data: items } = attemptIds.length
    ? await supabase
        .from("attempt_items")
        .select("attempt_id, question_id, correct")
        .in("attempt_id", attemptIds)
    : { data: [] };

  const totalAnswered = items?.length ?? 0;
  const totalCorrect = items?.filter((i) => i.correct).length ?? 0;

  const wrongQuestionIds = [...new Set((items ?? []).filter((i) => !i.correct && i.question_id).map((i) => i.question_id as string))];
  const { data: wrongQuestions } = wrongQuestionIds.length
    ? await supabase.from("question_bank").select("id, part_type").in("id", wrongQuestionIds)
    : { data: [] };
  const partTypeByQuestion = new Map((wrongQuestions ?? []).map((q) => [q.id, q.part_type]));

  const counts = new Map<string, ErrorBreakdownEntry>();
  for (const item of items ?? []) {
    if (item.correct || !item.question_id) continue;
    const skill = skillByAttempt.get(item.attempt_id) ?? "?";
    const partType = partTypeByQuestion.get(item.question_id) ?? "?";
    const key = `${skill}::${partType}`;
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { skill, partType, count: 1 });
  }

  const errorBreakdown = [...counts.values()].sort((a, b) => b.count - a.count);

  let text: string;
  try {
    text = await generateWeeklyInsight({ totalAnswered, totalCorrect, errorBreakdown });
  } catch {
    return NextResponse.json({ error: "Falha ao gerar insight" }, { status: 500 });
  }

  const generatedAt = new Date().toISOString();
  await supabase
    .from("profiles")
    .update({ weekly_insight_text: text, weekly_insight_generated_at: generatedAt })
    .eq("id", user.id);

  return NextResponse.json({ text, generatedAt });
}
