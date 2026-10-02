import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification, sendReminderEmail } from "@/lib/server/reminders";
import type { Profile, PushSubscriptionRow } from "@/lib/types/database";

// Triggered once a day by Vercel Cron (see vercel.json). Reminds anyone who
// opted in and hasn't hit their daily goal yet today — never twice the same
// day, guarded by profiles.last_reminder_sent_date.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // last_reminder_sent_date starts out NULL for every profile, and plain
  // .neq() never matches NULL in Postgres — so that case needs its own
  // "or is null" branch, as a second .or() ANDed against the first.
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, daily_goal_questions, reminder_push_enabled, reminder_email_enabled, last_reminder_sent_date")
    .or("reminder_push_enabled.eq.true,reminder_email_enabled.eq.true")
    .or(`last_reminder_sent_date.is.null,last_reminder_sent_date.neq.${today}`);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  let reminded = 0;
  let skippedGoalMet = 0;

  for (const profile of (profiles ?? []) as Profile[]) {
    const { data: activity } = await supabase
      .from("daily_activity")
      .select("questions_answered")
      .eq("user_id", profile.id)
      .eq("activity_date", today)
      .maybeSingle();

    const answeredToday = activity?.questions_answered ?? 0;
    if (answeredToday >= profile.daily_goal_questions) {
      skippedGoalMet++;
      continue;
    }

    const body = "Você ainda não praticou hoje. Bora manter a streak viva?";

    if (profile.reminder_push_enabled) {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth_key")
        .eq("user_id", profile.id);

      for (const sub of (subs ?? []) as PushSubscriptionRow[]) {
        const stillValid = await sendPushNotification(sub, {
          title: "Cambridge C1 Prep",
          body,
          url: "/practice",
        });
        if (!stillValid) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    if (profile.reminder_email_enabled) {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
      if (userData.user?.email) {
        await sendReminderEmail(userData.user.email, body);
      }
    }

    await supabase.from("profiles").update({ last_reminder_sent_date: today }).eq("id", profile.id);
    reminded++;
  }

  return NextResponse.json({ ok: true, reminded, skippedGoalMet });
}
