import { CheckCircle2, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Reachable only by admins — enforced by proxy.ts and RLS on question_bank.
export default async function ReviewQueuePage() {
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("question_bank")
    .select("id, skill, part_type, content, correct_answer, blind_solver_answer, audit_notes")
    .eq("status", "needs_human_review")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <Wrench size={24} className="text-brand" strokeWidth={2.25} />
        Fila de revisão
      </h1>
      {!pending || pending.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border p-8 text-center">
          <CheckCircle2 size={32} className="text-success" strokeWidth={1.75} />
          <p className="text-sm text-muted">Nenhuma questão pendente.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {pending.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm font-bold text-muted">
                {item.skill} · {item.part_type}
              </p>
              <p className="mt-2 inline-block rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
                Gerador: {item.correct_answer} · Resolvedor cego: {item.blind_solver_answer ?? "—"}
              </p>
              {/* TODO: approve/reject actions (Server Action updating status + reviewed_by) */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
