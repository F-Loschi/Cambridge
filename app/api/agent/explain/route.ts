import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { explainAnswer } from "@/lib/agent/explainAnswer";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { partType, prompt, userAnswer, correctAnswer, isCorrect } = body as {
    partType: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  };

  if (!prompt || !correctAnswer) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const explanation = await explainAnswer({ partType, prompt, userAnswer, correctAnswer, isCorrect });
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("explain failed:", err);
    return NextResponse.json({ error: "Falha ao gerar explicação" }, { status: 500 });
  }
}
