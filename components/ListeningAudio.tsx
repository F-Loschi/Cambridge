"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Headphones, Play, Square } from "lucide-react";
import { pickEnglishVoice, splitSentences } from "@/lib/ui/speech";

// Real CAE Listening plays each recording twice.
const MAX_PLAYS = 2;

const subscribeNothing = () => () => {};
const detectSpeech = () => "speechSynthesis" in window;
const noSpeechOnServer = () => false;

export function ListeningAudio({ text, revealed }: { text: string; revealed: boolean }) {
  const supported = useSyncExternalStore(subscribeNothing, detectSpeech, noSpeechOnServer);
  const [plays, setPlays] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [noEnglishVoice, setNoEnglishVoice] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function play() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = synth.getVoices();
    const voice = pickEnglishVoice(voices);
    // Voices installed but none English: the browser would read the English
    // text in a Portuguese voice, which is worse than no audio.
    if (!voice && voices.length > 0) {
      setNoEnglishVoice(true);
      return;
    }
    const sentences = splitSentences(text);

    setPlays((p) => p + 1);
    setSpeaking(true);
    sentences.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = voice?.lang ?? "en-GB";
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      if (i === sentences.length - 1) {
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
      }
      synth.speak(utterance);
    });
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  // Without usable English audio, showing the text is better than a dead
  // question.
  if (!supported || noEnglishVoice) {
    return (
      <div className="mb-4 rounded-2xl bg-background p-4 text-sm text-muted">
        <p className="mb-1 text-xs font-bold">
          {supported
            ? "Seu navegador não tem voz em inglês instalada (no Windows: Configurações > Hora e idioma > Fala). Transcrição:"
            : "Áudio indisponível neste navegador — transcrição:"}
        </p>
        <p>{text}</p>
      </div>
    );
  }

  const exhausted = plays >= MAX_PLAYS && !speaking;

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-background p-4">
        <div className="flex items-center gap-2">
          <Headphones size={20} className="text-teal" strokeWidth={2.25} />
          <div>
            <p className="text-sm font-bold">Ouça o trecho</p>
            <p className="text-xs text-muted">
              {plays}/{MAX_PLAYS} reproduções
            </p>
          </div>
        </div>
        {speaking ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Parar áudio"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-teal text-white shadow-sm"
          >
            <Square size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={play}
            disabled={exhausted}
            aria-label="Reproduzir áudio"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-teal text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-40"
          >
            <Play size={18} />
          </button>
        )}
      </div>

      {revealed && (
        <div className="rounded-2xl bg-background p-4 text-sm text-muted">
          <p className="mb-1 text-xs font-bold">Transcrição</p>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}
