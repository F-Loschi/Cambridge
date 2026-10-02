"use client";

import { useState } from "react";
import { Bell, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { urlBase64ToUint8Array } from "@/lib/ui/pushKey";

export function ReminderSettings({
  userId,
  initialPushEnabled,
  initialEmailEnabled,
}: {
  userId: string;
  initialPushEnabled: boolean;
  initialEmailEnabled: boolean;
}) {
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled);
  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);
  const [pushBusy, setPushBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pushSupported =
    typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

  async function enablePush() {
    if (Notification.permission === "denied") {
      throw new Error("Notificações estão bloqueadas nas configurações do navegador.");
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Permissão de notificação não concedida.");
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
    });

    const json = subscription.toJSON();
    const supabase = createClient();
    const { error: subError } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth_key: json.keys!.auth,
      },
      { onConflict: "endpoint" },
    );
    if (subError) throw subError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ reminder_push_enabled: true })
      .eq("id", userId);
    if (profileError) throw profileError;
  }

  async function disablePush() {
    const supabase = createClient();
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        await subscription.unsubscribe();
      }
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ reminder_push_enabled: false })
      .eq("id", userId);
    if (profileError) throw profileError;
  }

  async function togglePush() {
    setPushBusy(true);
    setError(null);
    try {
      if (pushEnabled) {
        await disablePush();
        setPushEnabled(false);
      } else {
        await enablePush();
        setPushEnabled(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar notificações");
    } finally {
      setPushBusy(false);
    }
  }

  async function toggleEmail() {
    setEmailBusy(true);
    setError(null);
    const next = !emailEnabled;
    const supabase = createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ reminder_email_enabled: next })
      .eq("id", userId);
    setEmailBusy(false);
    if (profileError) {
      setError(profileError.message);
      return;
    }
    setEmailEnabled(next);
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-1 text-sm font-extrabold">Lembretes</h2>
      <p className="mb-4 text-xs text-muted">
        Um aviso à noite se você ainda não bateu sua meta diária.
      </p>

      <div className="flex items-center justify-between gap-3 border-b border-border py-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-brand" strokeWidth={2.25} />
          <div>
            <p className="text-sm font-bold">Notificação push</p>
            {!pushSupported && (
              <p className="text-xs text-muted">Não suportado neste navegador</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={togglePush}
          disabled={pushBusy || !pushSupported}
          className={`rounded-full px-4 py-2 text-xs font-extrabold transition-colors disabled:opacity-50 ${
            pushEnabled ? "bg-brand text-white" : "border border-border text-muted"
          }`}
        >
          {pushBusy ? "..." : pushEnabled ? "Ativado" : "Ativar"}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-brand" strokeWidth={2.25} />
          <p className="text-sm font-bold">Lembrete por e-mail</p>
        </div>
        <button
          type="button"
          onClick={toggleEmail}
          disabled={emailBusy}
          className={`rounded-full px-4 py-2 text-xs font-extrabold transition-colors disabled:opacity-50 ${
            emailEnabled ? "bg-brand text-white" : "border border-border text-muted"
          }`}
        >
          {emailBusy ? "..." : emailEnabled ? "Ativado" : "Ativar"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm font-bold text-danger">{error}</p>}
    </div>
  );
}
