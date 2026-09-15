import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CAMBRIDGE_SCALE } from "@/lib/scoring/scale";
import { bumpDailyActivity } from "@/lib/server/dailyActivity";
import { updateReviewItems } from "@/lib/server/reviewQueue";
import type { Skill } from "@/lib/types/database";

interface SubmittedItem {
  question_id: string;
  skill: Skill;
  question_number: number;
  user_answer: string;
  correct_answer: string;
  correct: boolean;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items, source } = (await request.json()) as {
    items: SubmittedItem[];
    source?: "practice" | "mock_test";
  };
  if (!items?.length) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  // A page's practice session is always one skill, but group defensively.
  const bySkill = new Map<Skill, SubmittedItem[]>();
  for (const item of items) {
    bySkill.set(item.skill, [...(bySkill.get(item.skill) ?? []), item]);
  }

  for (const [skill, skillItems] of bySkill) {
    const correctCount = skillItems.filter((i) => i.correct).length;
    const scaledScore =
      CAMBRIDGE_SCALE.min +
      (correctCount / skillItems.length) * (CAMBRIDGE_SCALE.max - CAMBRIDGE_SCALE.min);

    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        user_id: user.id,
        skill,
        source: source ?? "practice",
        finished_at: new Date().toISOString(),
        raw_score: correctCount,
        scaled_score: scaledScore,
      })
      .select("id")
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: attemptError?.message ?? "Failed to save attempt" }, { status: 500 });
    }

    const { error: itemsError } = await supabase.from("attempt_items").insert(
      skillItems.map((i) => ({
        attempt_id: attempt.id,
        question_id: i.question_id,
        question_number: i.question_number,
        correct: i.correct,
        user_answer: i.user_answer,
        correct_answer: i.correct_answer,
      })),
    );

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
  }

  await bumpDailyActivity(supabase, user.id);

  // Only wrong answers enter the spaced-repetition queue — a fresh correct
  // answer to a question that happens to already be queued doesn't touch it
  // here; it only advances via the dedicated review flow.
  await updateReviewItems(
    supabase,
    user.id,
    items.filter((i) => !i.correct).map((i) => ({ question_id: i.question_id, correct: false })),
  );

  return NextResponse.json({ ok: true });
}
