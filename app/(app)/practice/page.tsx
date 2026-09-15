import Link from "next/link";
import { ChevronRight, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";

export default async function PracticeHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dueCount = 0;
  if (user) {
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await supabase
      .from("review_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("due_at", today);
    dueCount = count ?? 0;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-extrabold">Escolha uma frente</h1>
      <p className="mb-6 text-sm text-muted">
        Pratique uma de cada vez e mantenha sua streak viva.
      </p>

      <div className="flex flex-col gap-4">
        {dueCount > 0 && (
          <Link
            href="/practice/review"
            className="flex items-center gap-4 rounded-3xl border border-violet bg-violet/10 p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet/15">
              <RotateCcw size={24} strokeWidth={2.25} className="text-violet" />
            </div>
            <div className="flex-1">
              <p className="font-display text-base font-bold">Revisão</p>
              <p className="text-xs text-muted">
                {dueCount} questã{dueCount === 1 ? "o" : "ões"} pendente{dueCount === 1 ? "" : "s"} do banco de erros
              </p>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </Link>
        )}

        {SKILL_ORDER.map((skill) => {
          const meta = SKILL_META[skill];
          const Icon = meta.icon;
          return (
            <Link
              key={skill}
              href={`/practice/${skill}`}
              className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}
              >
                <Icon size={24} strokeWidth={2.25} style={{ color: meta.color }} />
              </div>
              <div className="flex-1">
                <p className="font-display text-base font-bold">{meta.label}</p>
                <p className="text-xs text-muted">Toque pra começar a praticar</p>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
