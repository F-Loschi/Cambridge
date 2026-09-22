"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, RotateCcw, Send, Sparkles, Square } from "lucide-react";
import { formatMMSS } from "@/lib/ui/time";
import type { SpeakingFeedback } from "@/lib/agent/gradeSpeaking";

interface SpeakingQuestion {
  id: string;
  content: Record<string, unknown>;
}

type Status = "idle" | "recording" | "recorded" | "submitting" | "done";

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const candidate of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return "audio/webm";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function SpeakingRecorder({ questions }: { questions: SpeakingQuestion[] }) {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(() => Math.floor(Math.random() * questions.length));
  const question = questions[questionIndex];
  const promptText =
    typeof question?.content.prompt === "string"
      ? question.content.prompt
      : "Fale sobre um assunto à sua escolha por 1-2 minutos.";

  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setStatus("recording");
    } catch {
      setError("Não consegui acessar o microfone — verifique a permissão do navegador.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function reRecord() {
    setAudioUrl(null);
    setFeedback(null);
    setError(null);
    setStatus("idle");
  }

  function practiceAnother() {
    setQuestionIndex(Math.floor(Math.random() * questions.length));
    reRecord();
    router.refresh();
  }

  async function submit() {
    if (chunksRef.current.length === 0) return;
    setStatus("submitting");
    setError(null);
    try {
      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch("/api/agent/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText, audioBase64, mimeType: mimeTypeRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao enviar");
      setFeedback(data.feedback);
      setStatus("done");
    } catch (err) {
      setStatus("recorded");
      setError(err instanceof Error ? err.message : "Falha ao enviar");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-1 text-xs font-bold text-muted">Fale por 1-2 minutos</p>
        <p className="text-base font-bold">{promptText}</p>
      </div>

      {status === "done" && feedback ? (
        <div className="animate-pop flex flex-col gap-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <p className="font-display text-3xl font-extrabold text-brand">{feedback.overallOutOf15}/15</p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-sm font-bold">{feedback.scores.grammarVocabulary}/5</p>
              <p className="text-[10px] font-bold text-muted">Gram. &amp; Vocab.</p>
            </div>
            <div>
              <p className="text-sm font-bold">{feedback.scores.discourseManagement}/5</p>
              <p className="text-[10px] font-bold text-muted">Organização</p>
            </div>
            <div>
              <p className="text-sm font-bold">{feedback.scores.pronunciation}/5</p>
              <p className="text-[10px] font-bold text-muted">Pronúncia</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-bold text-muted">Transcrição</p>
            <p className="rounded-2xl bg-background p-3 text-sm text-muted">{feedback.transcript}</p>
          </div>

          {feedback.strengths.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold text-success">Pontos fortes</p>
              <ul className="list-disc pl-4 text-sm">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold text-danger">Pra melhorar</p>
              <ul className="list-disc pl-4 text-sm">
                {feedback.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={practiceAnother}
            className="rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Praticar de novo
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-8">
          {status === "idle" && (
            <button
              type="button"
              onClick={startRecording}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-danger text-white shadow-lg transition-transform hover:scale-105"
              aria-label="Gravar"
            >
              <Mic size={32} />
            </button>
          )}

          {status === "recording" && (
            <>
              <p className="font-display text-2xl font-extrabold text-danger">{formatMMSS(seconds)}</p>
              <button
                type="button"
                onClick={stopRecording}
                className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-danger text-white shadow-lg"
                aria-label="Parar"
              >
                <Square size={28} />
              </button>
            </>
          )}

          {status === "recorded" && audioUrl && (
            <>
              <audio controls src={audioUrl} className="w-full" />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={reRecord}
                  className="flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2 text-sm font-bold"
                >
                  <RotateCcw size={16} /> Regravar
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="flex items-center gap-1.5 rounded-2xl bg-brand px-4 py-2 text-sm font-extrabold text-white"
                >
                  <Send size={16} /> Enviar
                </button>
              </div>
            </>
          )}

          {status === "submitting" && (
            <p className="flex items-center gap-2 text-sm font-bold text-muted">
              <Sparkles size={16} className="animate-spin" /> Avaliando sua gravação...
            </p>
          )}
        </div>
      )}

      {error && <p className="text-sm font-bold text-danger">{error}</p>}
    </div>
  );
}
