import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWritingTask, type WritingTaskType } from "@/lib/agent/generateWritingTask";

export const maxDuration = 60;

const VALID_TYPES: WritingTaskType[] = ["essay", "letter_email", "report", "review", "proposal"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { taskType } = body as { taskType: WritingTaskType };

  if (!VALID_TYPES.includes(taskType)) {
    return NextResponse.json({ error: "Invalid taskType" }, { status: 400 });
  }

  try {
    const task = await generateWritingTask(taskType);
    return NextResponse.json(task);
  } catch (err) {
    console.error("generateWritingTask failed:", err);
    return NextResponse.json({ error: "Falha ao gerar a tarefa" }, { status: 500 });
  }
}
