import { AGENT_MODEL, generateContentWithRetry, getGeminiClient } from "@/lib/agent/client";

export interface ErrorBreakdownEntry {
  skill: string;
  partType: string;
  count: number;
}

const SYSTEM_PROMPT = `You are an encouraging Cambridge C1 Advanced English tutor.
Given a student's practice stats from the last 7 days and a breakdown of
their wrong answers by skill/question type, write a short insight in
Portuguese (pt-BR): 2-3 sentences, naming their weakest area specifically
and one concrete thing to focus on next. Plain prose, no headers, no bullet
points, warm but direct tone.`;

export async function generateWeeklyInsight(params: {
  totalAnswered: number;
  totalCorrect: number;
  errorBreakdown: ErrorBreakdownEntry[];
}): Promise<string> {
  if (params.totalAnswered === 0) {
    return "Você ainda não praticou essa semana — comece hoje pra eu conseguir te dar um insight na próxima!";
  }

  const ai = getGeminiClient();
  const response = await generateContentWithRetry(ai, {
    model: AGENT_MODEL,
    config: { systemInstruction: SYSTEM_PROMPT },
    contents: `Últimos 7 dias: ${params.totalCorrect}/${params.totalAnswered} respostas corretas.
Erros por frente / tipo de questão:
${
  params.errorBreakdown.length
    ? params.errorBreakdown.map((e) => `- ${e.skill} / ${e.partType}: ${e.count} erro(s)`).join("\n")
    : "(nenhum erro registrado — semana perfeita)"
}`,
  });

  return response.text ?? "Não consegui gerar o insight agora.";
}
