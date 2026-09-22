import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // proxy.ts already redirects unauthenticated users

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, exam_date, daily_goal_questions")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-sm px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold">Perfil</h1>
      <ProfileForm
        userId={user.id}
        email={user.email ?? ""}
        initialFullName={profile?.full_name ?? ""}
        initialExamDate={profile?.exam_date ?? null}
        initialDailyGoal={profile?.daily_goal_questions ?? 5}
      />
    </div>
  );
}
