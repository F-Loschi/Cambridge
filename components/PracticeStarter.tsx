"use client";

import { useState } from "react";
import { Clock, Zap } from "lucide-react";
import { QuestionRunner, type RunnerQuestion } from "@/components/QuestionRunner";

export function PracticeStarter({
  questions,
  mockMinutes,
}: {
  questions: RunnerQuestion[];
  mockMinutes: number;
}) {
  const [mode, setMode] = useState<"practice" | "mock_test" | null>(null);

  if (mode === null) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setMode("practice")}
          className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10">
            <Zap size={22} strokeWidth={2.25} className="text-brand" />
          </div>
          <div>
            <p className="font-display text-base font-bold">Praticar sem pressa</p>
            <p className="text-xs text-muted">Sem cronômetro, no seu ritmo</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("mock_test")}
          className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-streak/10">
            <Clock size={22} strokeWidth={2.25} className="text-streak" />
          </div>
          <div>
            <p className="font-display text-base font-bold">Simulado cronometrado</p>
            <p className="text-xs text-muted">{mockMinutes} min, nas condições da prova real</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <QuestionRunner
      questions={questions}
      submitUrl="/api/attempts/submit"
      onFinishHref="/practice"
      source={mode}
      timeLimitSeconds={mode === "mock_test" ? mockMinutes * 60 : undefined}
    />
  );
}
