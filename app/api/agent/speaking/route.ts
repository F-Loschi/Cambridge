import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gradeSpeaking } from "@/lib/agent/gradeSpeaking";
import { CAMBRIDGE_SCALE } from "@/lib/scoring/scale";
import { reconcileGamification } from "@/lib/server/gamification";

const OVERALL_MAX = 15;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { promptText, audioBase64, mimeType } = body as {
    promptText: string;
    audioBase64: string;
    mimeType: string;
  };

  if (!promptText || !audioBase64 || !mimeType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let feedback;
  try {
    feedback = await gradeSpeaking({ promptText, audioBase64, mimeType });
  } catch {
    return NextResponse.json({ error: "Falha ao avaliar a gravação" }, { status: 500 });
  }

  const scaledScore =
    CAMBRIDGE_SCALE.min +
    (feedback.overallOutOf15 / OVERALL_MAX) * (CAMBRIDGE_SCALE.max - CAMBRIDGE_SCALE.min);

  const { error: attemptError } = await supabase.from("attempts").insert({
    user_id: user.id,
    skill: "speaking",
    source: "speaking_recording",
    finished_at: new Date().toISOString(),
    raw_score: feedback.overallOutOf15,
    scaled_score: scaledScore,
    ai_feedback: feedback,
  });

  if (attemptError) {
    return NextResponse.json({ error: attemptError.message }, { status: 500 });
  }

  await reconcileGamification(supabase, user.id, 1);

  return NextResponse.json({ feedback });
}
