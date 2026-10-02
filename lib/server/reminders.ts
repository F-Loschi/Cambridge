import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

/** Sends to one subscription; returns false (and lets the caller drop it) if the endpoint is gone (404/410). */
export async function sendPushNotification(
  sub: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string },
): Promise<boolean> {
  ensureConfigured();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
      JSON.stringify(payload),
    );
    return true;
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) return false;
    console.error("sendPushNotification failed:", err);
    return true; // transient error — keep the subscription, don't delete it
  }
}

export async function sendReminderEmail(to: string, body: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Cambridge C1 Prep <onboarding@resend.dev>",
      to,
      subject: "Hora de praticar seu inglês",
      html: `<p>${body}</p>`,
    }),
  });

  if (!res.ok) {
    console.error("sendReminderEmail failed:", await res.text().catch(() => res.statusText));
  }
}
