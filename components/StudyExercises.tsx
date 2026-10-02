"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { QuestionRunner, type RunnerQuestion } from "@/components/QuestionRunner";

export function StudyExercises({
  questions,
  returnHref,
}: {
  questions: RunnerQuestion[];
  returnHref: string;
}) {
  const [started, setStarted] = useState(false);

  if (questions.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted">
        Ainda não há exercícios de treino aqui. Volte em breve.
      </p>
    );
  }

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5"
      >
        <Dumbbell size={16} strokeWidth={2.5} />
        Fazer {questions.length} exercícios
      </button>
    );
  }

  return (
    <QuestionRunner
      questions={questions}
      submitUrl="/api/attempts/submit"
      onFinishHref={returnHref}
      source="training"
    />
  );
}
