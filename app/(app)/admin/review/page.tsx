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
      <h1 className="mb-6 text-2xl font-extrabold">🛠️ Fila de revisão</h1>
      {!pending || pending.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl">✅</p>
          <p className="mt-2 text-sm text-muted">Nenhuma questão pendente.</p>
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
