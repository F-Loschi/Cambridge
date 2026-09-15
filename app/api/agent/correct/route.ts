import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { correctWriting } from "@/lib/agent/correctWriting";

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

  const feedback = await correctWriting({ taskPrompt, taskType, candidateText });

  const { data: attempt, error } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      skill: "writing",
      source: "writing_task",
      finished_at: new Date().toISOString(),
      raw_score: feedback.overallOutOf20,
      ai_feedback: feedback,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attempt, feedback });
}
