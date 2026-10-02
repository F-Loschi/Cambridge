"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PenLine, Sparkles } from "lucide-react";
import { RichText } from "@/components/RichText";
import type { WritingTaskType } from "@/lib/agent/generateWritingTask";
import { WRITING_TASK_LABELS } from "@/lib/agent/generateWritingTask";
import type { WritingFeedback } from "@/lib/agent/correctWriting";

const TASK_TYPES: WritingTaskType[] = ["essay", "letter_email", "report", "review", "proposal"];

type Status = "picking" | "loadingTask" | "writing" | "submitting" | "done";

export function WritingTask() {
  const router = useRouter();
  const [taskType, setTaskType] = useState<WritingTaskType>("essay");
  const [status, setStatus] = useState<Status>("picking");
  const [prompt, setPrompt] = useState("");
  const [candidateText, setCandidateText] = useState("");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = candidateText.trim() ? candidateText.trim().split(/\s+/).length : 0;

  async function generateTask() {
    setStatus("loadingTask");
    setError(null);
    try {
      const res = await fetch("/api/agent/writing-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar a tarefa");
      setPrompt(data.prompt);
      setStatus("writing");
    } catch (err) {
      setStatus("picking");
      setError(err instanceof Error ? err.message : "Falha ao gerar a tarefa");
    }
  }

  async function submit() {
    if (!candidateText.trim()) return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/agent/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskPrompt: prompt, taskType, candidateText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao corrigir");
      setFeedback(data.feedback);
      setStatus("done");
    } catch (err) {
      setStatus("writing");
      setError(err instanceof Error ? err.message : "Falha ao corrigir");
    }
  }

  function practiceAnother() {
    setStatus("picking");
    setPrompt("");
    setCandidateText("");
    setFeedback(null);
    setError(null);
    router.refresh();
  }

  if (status === "done" && feedback) {
    return (
      <div className="animate-pop flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <p className="font-display text-4xl font-extrabold text-brand">{feedback.overallOutOf20}/20</p>

        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div>
            <p className="text-sm font-bold">{feedback.scores.content}/5</p>
            <p className="text-[10px] font-bold text-muted">Conteúdo</p>
          </div>
          <div>
            <p className="text-sm font-bold">{feedback.scores.communicativeAchievement}/5</p>
            <p className="text-[10px] font-bold text-muted">Comunicação</p>
          </div>
          <div>
            <p className="text-sm font-bold">{feedback.scores.organisation}/5</p>
            <p className="text-[10px] font-bold text-muted">Organização</p>
          </div>
          <div>
            <p className="text-sm font-bold">{feedback.scores.language}/5</p>
            <p className="text-[10px] font-bold text-muted">Linguagem</p>
          </div>
        </div>

        {feedback.strengths.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold text-success">Pontos fortes</p>
            <ul className="list-disc pl-4 text-sm">
              {feedback.strengths.map((s, i) => (
                <li key={i}>
                    <RichText text={s} />
                  </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold text-danger">Pra melhorar</p>
            <ul className="list-disc pl-4 text-sm">
              {feedback.improvements.map((s, i) => (
                <li key={i}>
                    <RichText text={s} />
                  </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.annotatedErrors.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold text-muted">Trechos anotados</p>
            <div className="flex flex-col gap-2">
              {feedback.annotatedErrors.map((e, i) => (
                <div key={i} className="rounded-2xl bg-background p-3 text-sm">
                  <p className="font-bold text-danger">&ldquo;{e.quote}&rdquo;</p>
                  <p className="text-muted">
                    <RichText text={e.issue} />
                  </p>
                  <p className="text-success">
                    <RichText text={e.suggestion} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={practiceAnother}
          className="rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Praticar outra
        </button>
      </div>
    );
  }

  if (status === "writing" || status === "submitting") {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <p className="mb-1 text-xs font-bold text-muted">{WRITING_TASK_LABELS[taskType]}</p>
          <p className="whitespace-pre-wrap text-sm font-bold">{prompt}</p>
        </div>

        <textarea
          value={candidateText}
          onChange={(e) => setCandidateText(e.target.value)}
          disabled={status === "submitting"}
          placeholder="Escreva sua resposta aqui..."
          rows={12}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand disabled:opacity-70"
        />
        <p className={`text-xs font-bold ${wordCount < 220 || wordCount > 260 ? "text-danger" : "text-success"}`}>
          {wordCount} palavras (meta: 220-260)
        </p>

        <button
          type="button"
          onClick={submit}
          disabled={status === "submitting" || !candidateText.trim()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {status === "submitting" ? (
            <>
              <Sparkles size={16} className="animate-spin" /> Corrigindo...
            </>
          ) : (
            "Enviar pra correção"
          )}
        </button>

        {error && <p className="text-sm font-bold text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold">Escolha o tipo de tarefa</p>
        <div className="flex flex-col gap-2">
          {TASK_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTaskType(t)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                taskType === t ? "border-brand bg-brand/10 text-brand" : "border-border"
              }`}
            >
              {taskType === t ? <CheckCircle2 size={16} /> : <PenLine size={16} />}
              {WRITING_TASK_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={generateTask}
        disabled={status === "loadingTask"}
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {status === "loadingTask" ? (
          <>
            <Sparkles size={16} className="animate-spin" /> Gerando tarefa...
          </>
        ) : (
          "Gerar tarefa"
        )}
      </button>

      {error && <p className="text-sm font-bold text-danger">{error}</p>}
    </div>
  );
}
