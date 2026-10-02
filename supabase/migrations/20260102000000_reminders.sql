-- Daily reminder notifications (push + email) for days the user hasn't hit
-- their daily goal yet. last_reminder_sent_date guards against double-sends
-- if the cron job is ever triggered twice in the same day.

alter table profiles add column reminder_push_enabled boolean not null default false;
alter table profiles add column reminder_email_enabled boolean not null default false;
alter table profiles add column last_reminder_sent_date date;

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "users manage own push_subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
