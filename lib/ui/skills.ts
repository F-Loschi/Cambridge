import type { Skill } from "@/lib/types/database";

export const SKILL_META: Record<
  Skill,
  { label: string; short: string; emoji: string; color: string }
> = {
  reading_use_of_english: {
    label: "Reading & Use of English",
    short: "Reading",
    emoji: "📖",
    color: "var(--color-brand)",
  },
  writing: {
    label: "Writing",
    short: "Writing",
    emoji: "✍️",
    color: "var(--color-violet)",
  },
  listening: {
    label: "Listening",
    short: "Listening",
    emoji: "🎧",
    color: "var(--color-teal)",
  },
  speaking: {
    label: "Speaking",
    short: "Speaking",
    emoji: "🗣️",
    color: "var(--color-streak)",
  },
};

export const SKILL_ORDER: Skill[] = [
  "reading_use_of_english",
  "writing",
  "listening",
  "speaking",
];
