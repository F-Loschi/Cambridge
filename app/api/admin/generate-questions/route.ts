import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AGENT_MODEL } from "@/lib/agent/client";
import { auditQuestion, blindSolve, generateQuestion } from "@/lib/agent/questionPipeline";
import { checkQuestionFormat } from "@/lib/agent/questionFormat";
import { findPartType } from "@/lib/agent/partTypeCatalog";

// One question per request, generator + blind solver each take a few
// seconds with a thinking model — a batch loop here risked the platform's
// default function timeout. The admin UI just calls this repeatedly.
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { partTypeId } = (await request.json()) as { partTypeId: string };
  const partType = findPartType(partTypeId);
  if (!partType) {
    return NextResponse.json({ error: "Unknown part_type" }, { status: 400 });
  }

  try {
    const generated = await generateQuestion({
      skill: partType.skill,
      partType: partType.id,
      kind: partType.kind,
      calibrationExamples: partType.calibrationExamples,
    });

    const blind = await blindSolve({
      skill: partType.skill,
      partType: partType.id,
      content: generated.content,
    });

    const formatOk = checkQuestionFormat(partType, generated);
    const audit = auditQuestion({
      generatorAnswer: generated.correctAnswer,
      blindSolverAnswer: blind.answer,
      formatChecksPassed: formatOk,
    });

    const { data: row, error } = await supabase
      .from("question_bank")
      .insert({
        skill: partType.skill,
        part_type: partType.id,
        content: generated.content,
        correct_answer: generated.correctAnswer,
        explanation: generated.explanation,
        difficulty_estimate: generated.difficultyEstimate,
        status: audit.status,
        generator_model: AGENT_MODEL,
        blind_solver_answer: blind.answer,
        audit_notes: { notes: audit.notes },
      })
      .select()
      .single();

    if (error || !row) {
      return NextResponse.json({ error: error?.message ?? "Failed to save question" }, { status: 500 });
    }

    return NextResponse.json({ question: row });
  } catch (err) {
    console.error("generate-questions failed:", err);
    const message = err instanceof Error ? err.message : "Falha ao gerar questão";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
