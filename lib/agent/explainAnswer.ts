import { AGENT_MODEL, generateContentWithRetry, getGeminiClient } from "@/lib/agent/client";

const SYSTEM_PROMPT = `You are a friendly Cambridge C1 Advanced English tutor.
A student just answered a practice question. Explain, in Portuguese (pt-BR),
in 2-4 short sentences, why the correct answer is right and — when the
student got it wrong — what likely led them to their answer and the
grammar/vocabulary point they should review. Be warm but concise, no headers
or bullet points, plain prose only.`;

export async function explainAnswer(params: {
  partType: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}): Promise<string> {
  const ai = getGeminiClient();

  const response = await generateContentWithRetry(ai, {
    model: AGENT_MODEL,
    config: { systemInstruction: SYSTEM_PROMPT },
    contents: `Tipo de questão: ${params.partType}
Enunciado: """${params.prompt}"""
Resposta do aluno: "${params.userAnswer}"
Resposta correta: "${params.correctAnswer}"
O aluno acertou: ${params.isCorrect ? "sim" : "não"}`,
  });

  return response.text ?? "Não consegui gerar uma explicação agora — tenta de novo.";
}
