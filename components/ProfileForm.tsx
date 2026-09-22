"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DatePicker } from "@/components/DatePicker";

export function ProfileForm({
  userId,
  email,
  initialFullName,
  initialExamDate,
  initialDailyGoal,
}: {
  userId: string;
  email: string;
  initialFullName: string;
  initialExamDate: string | null;
  initialDailyGoal: number;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [examDate, setExamDate] = useState(initialExamDate ?? "");
  const [dailyGoal, setDailyGoal] = useState(String(initialDailyGoal));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const goal = Math.min(50, Math.max(1, Number(dailyGoal) || 1));

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, exam_date: examDate || null, daily_goal_questions: goal })
      .eq("id", userId);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDailyGoal(String(goal));
    setSavedAt(Date.now());
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSave} className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <label className="mb-1 block text-xs font-bold text-muted">Nome</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setSavedAt(null);
          }}
          placeholder="Seu nome"
          className="mb-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand"
        />

        <label className="mb-1 block text-xs font-bold text-muted">E-mail</label>
        <p className="mb-4 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted">
          {email}
        </p>

        <label className="mb-1 block text-xs font-bold text-muted">Data do exame</label>
        <div className="mb-4">
          <DatePicker
            value={examDate}
            onChange={(iso) => {
              setExamDate(iso);
              setSavedAt(null);
            }}
          />
        </div>

        <label className="mb-1 block text-xs font-bold text-muted">Meta diária (questões)</label>
        <input
          type="number"
          min={1}
          max={50}
          value={dailyGoal}
          onChange={(e) => {
            setDailyGoal(e.target.value);
            setSavedAt(null);
          }}
          className="mb-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand"
        />

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Save size={16} strokeWidth={2.5} />
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>

        {savedAt && <p className="mt-3 text-sm font-bold text-success">Salvo!</p>}
        {error && <p className="mt-3 text-sm font-bold text-danger">{error}</p>}
      </form>

      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-extrabold text-danger shadow-sm transition-transform hover:-translate-y-0.5"
      >
        <LogOut size={16} strokeWidth={2.5} />
        Sair
      </button>
    </div>
  );
}
