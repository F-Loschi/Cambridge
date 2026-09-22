"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Sparkles, XCircle } from "lucide-react";
import { isAnswerCorrect } from "@/lib/scoring/grading";
import { readQuestionContent } from "@/lib/ui/questionContent";
import { formatMMSS } from "@/lib/ui/time";
import { SKILL_META } from "@/lib/ui/skills";
import type { Skill } from "@/lib/types/database";

export interface RunnerQuestion {
  id: string;
  skill: Skill;
  part_type: string;
  content: Record<string, unknown>;
  correct_answer: string;
}

interface ResultItem {
  question_id: string;
  skill: Skill;
  question_number: number;
  user_answer: string;
  correct_answer: string;
  correct: boolean;
}

export function QuestionRunner({
  questions,
  submitUrl,
  onFinishHref,
  source = "practice",
  timeLimitSeconds,
}: {
  questions: RunnerQuestion[];
  submitUrl: string;
  onFinishHref: string;
  source?: "practice" | "mock_test";
  timeLimitSeconds?: number;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [remaining, setRemaining] = useState<number | null>(timeLimitSeconds ?? null);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

  const finished = index >= questions.length;
  const current = !finished ? questions[index] : null;
  const parsed = current ? readQuestionContent(current.content) : null;

  const handleFinish = useCallback(
    async (finalResults: ResultItem[]) => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await fetch(submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source, items: finalResults }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Falha ao salvar");
        router.push(onFinishHref);
        router.refresh();
      } catch (err) {
        setSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Falha ao salvar");
      }
    },
    [submitUrl, source, router, onFinishHref],
  );

  // Countdown, only while there's a time limit and the session isn't over.
  // The expiry check lives inside the interval's own callback (an event,
  // not the effect body) so state updates there don't trigger the
  // "no setState directly in an effect" lint rule — and re-running this
  // effect on every relevant state change keeps that callback's closure
  // fresh instead of reading stale index/revealed/results.
  useEffect(() => {
    if (timeLimitSeconds == null || finished || remaining == null) return;

    const id = setInterval(() => {
      if (remaining > 1) {
        setRemaining(remaining - 1);
        return;
      }

      const answeredFrom = index + (revealed ? 1 : 0);
      const skipped: ResultItem[] = questions.slice(answeredFrom).map((q, offset) => ({
        question_id: q.id,
        skill: q.skill,
        question_number: answeredFrom + offset + 1,
        user_answer: "",
        correct_answer: q.correct_answer,
        correct: false,
      }));
      const finalResults = [...results, ...skipped];

      setTimedOut(true);
      setResults(finalResults);
      setIndex(questions.length);
      setRemaining(0);
      void handleFinish(finalResults);
    }, 1000);

    return () => clearInterval(id);
  }, [timeLimitSeconds, finished, remaining, index, revealed, results, questions, handleFinish]);

  function handleCheck() {
    if (!current || !answer.trim()) return;
    const correct = isAnswerCorrect(answer, current.correct_answer);
    setResults((r) => [
      ...r,
      {
        question_id: current.id,
        skill: current.skill,
        question_number: index + 1,
        user_answer: answer,
        correct_answer: current.correct_answer,
        correct,
      },
    ]);
    setRevealed(true);
  }

  function handleNext() {
    setIndex((i) => i + 1);
    setAnswer("");
    setRevealed(false);
    setExplanation(null);
  }

  async function handleExplain() {
    if (!current || !parsed || explaining) return;
    setExplaining(true);
    try {
      const res = await fetch("/api/agent/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partType: current.part_type,
          prompt: parsed.prompt ?? "",
          userAnswer: lastResult?.user_answer ?? "",
          correctAnswer: current.correct_answer,
          isCorrect: lastResult?.correct ?? false,
        }),
      });
      const data = await res.json();
      setExplanation(res.ok ? data.explanation : "Não consegui gerar uma explicação agora.");
    } catch {
      setExplanation("Não consegui gerar uma explicação agora.");
    } finally {
      setExplaining(false);
    }
  }

  const timerLabel =
    remaining != null ? (
      <span
        className={`flex items-center gap-1 text-xs font-bold ${
          remaining <= 300 ? "text-danger" : "text-muted"
        }`}
      >
        <Clock size={14} /> {formatMMSS(remaining)}
      </span>
    ) : null;

  if (finished) {
    const correctCount = results.filter((r) => r.correct).length;
    return (
      <div className="animate-pop rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
        {timedOut && <p className="mb-3 text-sm font-bold text-danger">Tempo esgotado!</p>}
        <p className="font-display text-4xl font-extrabold text-brand">
          {correctCount}/{results.length}
        </p>
        <p className="mt-1 text-sm text-muted">respostas corretas</p>
        <button
          type="button"
          onClick={() => handleFinish(results)}
          disabled={submitting}
          className="mt-6 w-full rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Concluir"}
        </button>
        {submitError && <p className="mt-3 text-sm font-bold text-danger">{submitError}</p>}
      </div>
    );
  }

  if (!current || !parsed) return null;
  const meta = SKILL_META[current.skill];
  const lastResult = revealed ? results[results.length - 1] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted">
          Questão {index + 1} de {questions.length} · {meta.short} · {current.part_type}
        </p>
        {timerLabel}
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        {parsed.contextText && (
          <p className="mb-4 rounded-2xl bg-background p-4 text-sm text-muted">{parsed.contextText}</p>
        )}
        <p className="mb-4 text-base font-bold">{parsed.prompt ?? "(pergunta sem texto)"}</p>

        {parsed.options ? (
          <div className="flex flex-col gap-2">
            {parsed.options.map((opt) => {
              const isSelected = answer === opt;
              const isCorrectOpt = revealed && isAnswerCorrect(opt, current.correct_answer);
              const isWrongSelected = revealed && isSelected && !isCorrectOpt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={revealed}
                  onClick={() => setAnswer(opt)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                    isCorrectOpt
                      ? "border-success bg-success/10 text-success"
                      : isWrongSelected
                        ? "border-danger bg-danger/10 text-danger"
                        : isSelected
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={answer}
            disabled={revealed}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Sua resposta"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand disabled:opacity-70"
          />
        )}

        {lastResult && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-2xl p-3 text-sm font-bold ${
              lastResult.correct ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            {lastResult.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {lastResult.correct ? "Certinho!" : `Resposta certa: ${current.correct_answer}`}
          </div>
        )}

        {revealed && !explanation && (
          <button
            type="button"
            onClick={handleExplain}
            disabled={explaining}
            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-violet disabled:opacity-50"
          >
            <Sparkles size={14} />
            {explaining ? "Pensando..." : "Por que essa resposta?"}
          </button>
        )}

        {explanation && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-violet/10 p-3 text-sm text-foreground">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-violet" />
            <p>{explanation}</p>
          </div>
        )}
      </div>

      {revealed ? (
        <button
          type="button"
          onClick={handleNext}
          className="rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          {index + 1 === questions.length ? "Ver resultado" : "Próxima"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!answer.trim()}
          className="rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          Conferir
        </button>
      )}
    </div>
  );
}
