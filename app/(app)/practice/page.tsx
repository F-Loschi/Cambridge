import Link from "next/link";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";

export default function PracticeHubPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-extrabold">Escolha uma frente</h1>
      <p className="mb-6 text-sm text-muted">
        Pratique uma de cada vez e mantenha sua streak viva 🔥
      </p>

      <div className="flex flex-col gap-4">
        {SKILL_ORDER.map((skill) => {
          const meta = SKILL_META[skill];
          return (
            <Link
              key={skill}
              href={`/practice/${skill}`}
              className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}
              >
                {meta.emoji}
              </div>
              <div className="flex-1">
                <p className="font-display text-base font-bold">{meta.label}</p>
                <p className="text-xs text-muted">Toque pra começar a praticar</p>
              </div>
              <span className="text-muted">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
