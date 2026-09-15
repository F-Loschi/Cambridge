import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/scoring/streak";
import { StreakFlame } from "@/components/StreakFlame";
import { NavLinks } from "@/components/NavLinks";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let streak = 0;
  let isAdmin = false;

  if (user) {
    const [{ data: activity }, { data: profile }] = await Promise.all([
      supabase
        .from("daily_activity")
        .select("activity_date, attempts_count")
        .eq("user_id", user.id),
      supabase.from("profiles").select("role").eq("id", user.id).single(),
    ]);
    streak = computeStreak(activity ?? []);
    isAdmin = profile?.role === "admin";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="font-display text-lg font-extrabold text-brand">
            Cambridge C1
          </span>
          <NavLinks isAdmin={isAdmin} variant="top" />
          <StreakFlame streak={streak} size="sm" />
        </div>
      </header>

      <main className="flex-1 pb-20 sm:pb-8">{children}</main>

      <NavLinks isAdmin={isAdmin} variant="bottom" />
    </div>
  );
}
