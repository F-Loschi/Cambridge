import Link from "next/link";
import { ArrowLeft, PartyPopper, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuestionRunner, type RunnerQuestion } from "@/components/QuestionRunner";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // proxy.ts already redirects unauthenticated users

  const today = new Date().toISOString().slice(0, 10);
  const { data: due } = await supabase
    .from("review_items")
    .select("question_id")
    .eq("user_id", user.id)
    .lte("due_at", today)
    .order("due_at", { ascending: true })
    .limit(20);

  const questionIds = (due ?? []).map((row) => row.question_id);
  const questions = questionIds.length
    ? ((
        await supabase
          .from("question_bank")
          .select("id, skill, part_type, content, correct_answer")
          .in("id", questionIds)
      ).data ?? [])
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/practice"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <RotateCcw size={22} className="text-violet" strokeWidth={2.25} />
        Revisão
      </h1>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border p-8 text-center">
          <PartyPopper size={32} className="text-success" strokeWidth={1.75} />
          <p className="text-sm text-muted">
            Nada pendente pra revisar agora. Volte mais tarde.
          </p>
        </div>
      ) : (
        <QuestionRunner
          questions={questions as RunnerQuestion[]}
          submitUrl="/api/review/submit"
          onFinishHref="/practice"
        />
      )}
    </div>
  );
}
