import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { correctWriting } from "@/lib/agent/correctWriting";
import { CAMBRIDGE_SCALE } from "@/lib/scoring/scale";
import { reconcileGamification } from "@/lib/server/gamification";

const OVERALL_MAX = 20;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { taskPrompt, taskType, candidateText } = body as {
    taskPrompt: string;
    taskType: "essay" | "letter_email" | "report" | "review" | "proposal";
    candidateText: string;
  };

  if (!taskPrompt || !taskType || !candidateText) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let feedback;
  try {
    feedback = await correctWriting({ taskPrompt, taskType, candidateText });
  } catch (err) {
    console.error("correctWriting failed:", err);
    return NextResponse.json({ error: "Falha ao corrigir a redação" }, { status: 500 });
  }

  const scaledScore =
    CAMBRIDGE_SCALE.min +
    (feedback.overallOutOf20 / OVERALL_MAX) * (CAMBRIDGE_SCALE.max - CAMBRIDGE_SCALE.min);

  const { data: attempt, error } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      skill: "writing",
      source: "writing_task",
      finished_at: new Date().toISOString(),
      raw_score: feedback.overallOutOf20,
      scaled_score: scaledScore,
      ai_feedback: feedback,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await reconcileGamification(supabase, user.id, 1);

  return NextResponse.json({ attempt, feedback });
}
