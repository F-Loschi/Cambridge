-- Cached weekly insight text so we don't regenerate it (and burn API quota)
-- on every dashboard load — only when the user asks or it's gone stale.

alter table profiles add column weekly_insight_text text;
alter table profiles add column weekly_insight_generated_at timestamptz;
