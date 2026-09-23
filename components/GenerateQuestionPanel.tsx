"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { PART_TYPES } from "@/lib/agent/partTypeCatalog";
import { SKILL_META } from "@/lib/ui/skills";
import type { QuestionBankItem } from "@/lib/types/database";

export function GenerateQuestionPanel() {
  const router = useRouter();
  const [partTypeId, setPartTypeId] = useState(PART_TYPES[0].id);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<QuestionBankItem | null>(null);
  const [tally, setTally] = useState({ approved: 0, needsReview: 0 });

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partTypeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar questão");
      const question = data.question as QuestionBankItem;
      setLastResult(question);
      setTally((t) =>
        question.status === "approved" ? { ...t, approved: t.approved + 1 } : { ...t, needsReview: t.needsReview + 1 },
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar questão");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <label className="mb-1 block text-xs font-bold text-muted">Tipo de questão</label>
        <select
          value={partTypeId}
          onChange={(e) => setPartTypeId(e.target.value)}
          disabled={generating}
          className="mb-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand"
        >
          {PART_TYPES.map((p) => (
            <option key={p.id} value={p.id}>
              {SKILL_META[p.skill].short} — {p.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {generating ? "Gerando..." : "Gerar questão"}
        </button>

        {(tally.approved > 0 || tally.needsReview > 0) && (
          <p className="mt-3 text-center text-xs font-bold text-muted">
            Nessa sessão: <span className="text-success">{tally.approved} aprovada{tally.approved === 1 ? "" : "s"}</span>
            {" · "}
            <span className="text-streak">{tally.needsReview} pra revisar</span>
          </p>
        )}

        {error && <p className="mt-3 text-sm font-bold text-danger">{error}</p>}
      </div>

      {lastResult && (
        <div className="animate-pop rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-muted">
              {lastResult.skill} · {lastResult.part_type}
            </p>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                lastResult.status === "approved" ? "bg-success/10 text-success" : "bg-streak/10 text-streak"
              }`}
            >
              <CheckCircle2 size={12} />
              {lastResult.status === "approved" ? "Aprovada" : "Precisa revisão"}
            </span>
          </div>

          {typeof lastResult.content.contextText === "string" && (
            <p className="mb-2 rounded-xl bg-background p-3 text-xs text-muted">
              {lastResult.content.contextText}
            </p>
          )}
          <p className="mb-2 text-sm font-bold">{String(lastResult.content.prompt ?? "")}</p>
          {Array.isArray(lastResult.content.options) && (
            <ul className="mb-2 flex flex-col gap-1">
              {(lastResult.content.options as string[]).map((opt, i) => (
                <li
                  key={i}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    opt === lastResult.correct_answer ? "bg-success/10 font-bold text-success" : "text-muted"
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted">
            Resposta: <span className="font-bold text-foreground">{lastResult.correct_answer}</span>
          </p>
          {lastResult.explanation && <p className="mt-2 text-xs text-muted">{lastResult.explanation}</p>}
        </div>
      )}
    </div>
  );
}
