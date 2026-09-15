-- Spaced-repetition queue: only questions a user got wrong end up here
-- (see app/api/attempts/submit). One row per (user, question); each review
-- pass pushes due_at forward or resets it, per lib/scoring/spacedRepetition.

create table review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  question_id uuid references question_bank (id) on delete cascade not null,
  interval_days int not null default 1,
  ease numeric not null default 2.5,
  due_at date not null default current_date,
  times_seen int not null default 0,
  times_correct int not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create index review_items_due_idx on review_items (user_id, due_at);

alter table review_items enable row level security;

create policy "users manage own review_items"
  on review_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
