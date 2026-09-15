"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm animate-pop rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <p className="mb-1 text-4xl">🔥</p>
        <h1 className="font-display mb-6 text-2xl font-extrabold text-brand">
          Cambridge C1 Prep
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
          {error && <p className="text-sm font-bold text-danger">{error}</p>}
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-xs font-bold text-muted underline"
        >
          {mode === "signin" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
