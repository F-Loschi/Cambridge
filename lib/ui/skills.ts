import { BookOpen, Headphones, Mic, PenLine, type LucideIcon } from "lucide-react";
import type { Skill } from "@/lib/types/database";

export const SKILL_META: Record<
  Skill,
  { label: string; short: string; icon: LucideIcon; color: string }
> = {
  reading_use_of_english: {
    label: "Reading & Use of English",
    short: "Reading",
    icon: BookOpen,
    color: "var(--color-brand)",
  },
  writing: {
    label: "Writing",
    short: "Writing",
    icon: PenLine,
    color: "var(--color-violet)",
  },
  listening: {
    label: "Listening",
    short: "Listening",
    icon: Headphones,
    color: "var(--color-teal)",
  },
  speaking: {
    label: "Speaking",
    short: "Speaking",
    icon: Mic,
    color: "var(--color-streak)",
  },
};

export const SKILL_ORDER: Skill[] = [
  "reading_use_of_english",
  "writing",
  "listening",
  "speaking",
];
