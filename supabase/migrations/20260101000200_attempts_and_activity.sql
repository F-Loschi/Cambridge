-- Attempts (a practice/mock session), their per-question breakdown, and the
-- daily activity log that the dashboard streak is computed from.

create table attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  skill skill not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  raw_score numeric,                  -- raw hits, or the AI-graded writing score
  scaled_score numeric,               -- converted to the Cambridge English Scale (~180-230)
  ai_feedback jsonb,                  -- structured feedback from the correction agent
  source text not null default 'practice'  -- 'practice' | 'mock_test' | 'writing_task' | 'speaking_recording'
);

create index attempts_user_skill_idx on attempts (user_id, skill);

create table attempt_items (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references attempts on delete cascade not null,
  question_id uuid references question_bank (id),
  question_number int,
  correct boolean,
  user_answer text,
  correct_answer text
);

create index attempt_items_attempt_idx on attempt_items (attempt_id);

create table daily_activity (
  user_id uuid references auth.users on delete cascade not null,
  activity_date date not null,
  minutes_studied int not null default 0,
  attempts_count int not null default 0,
  primary key (user_id, activity_date)
);

alter table attempts enable row level security;
alter table attempt_items enable row level security;
alter table daily_activity enable row level security;

-- Users manage only their own attempts/activity. Admins can read everything
-- (needed later for tutor-style aggregate tips / progress oversight).
create policy "users manage own attempts"
  on attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "admin reads all attempts"
  on attempts for select
  using (public.is_admin());

create policy "users manage own attempt_items"
  on attempt_items for all
  using (exists (
    select 1 from attempts
    where attempts.id = attempt_items.attempt_id
    and attempts.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from attempts
    where attempts.id = attempt_items.attempt_id
    and attempts.user_id = auth.uid()
  ));

create policy "users manage own daily_activity"
  on daily_activity for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
