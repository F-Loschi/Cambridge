"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles } from "lucide-react";

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export function WeeklyInsightCard({
  initialText,
  initialGeneratedAt,
  now,
}: {
  initialText: string | null;
  initialGeneratedAt: string | null;
  /** ISO timestamp captured server-side at render time — keeps staleness a pure calculation (no Date.now() during render). */
  now: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A freshly-generated insight (set from the API response, always newer
  // than `now`) correctly evaluates as not stale even though `now` itself
  // doesn't advance after the initial render.
  const isStale = !generatedAt || new Date(now).getTime() - new Date(generatedAt).getTime() > STALE_AFTER_MS;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/weekly-insight", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar insight");
      setText(data.text);
      setGeneratedAt(data.generatedAt);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar insight");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-pop rounded-3xl border border-violet/30 bg-violet/5 p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={18} className="text-violet" strokeWidth={2.25} />
        <p className="text-sm font-bold">Insight da semana</p>
      </div>

      {text ? (
        <p className="text-sm text-foreground">{text}</p>
      ) : (
        <p className="text-sm text-muted">
          Responda algumas questões e gere seu primeiro insight da semana.
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-violet disabled:opacity-50"
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading ? "Gerando..." : isStale ? "Gerar insight" : "Atualizar"}
      </button>

      {error && <p className="mt-2 text-xs font-bold text-danger">{error}</p>}
    </div>
  );
}
