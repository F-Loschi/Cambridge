-- Question bank, fed by the generator/blind-solver/auditor pipeline and
-- reviewed by admins before it becomes available for practice.

create type skill as enum ('reading_use_of_english', 'writing', 'listening', 'speaking');

create type review_status as enum ('draft', 'approved', 'rejected', 'needs_human_review');

create table question_bank (
  id uuid primary key default gen_random_uuid(),
  skill skill not null,
  part_type text not null,             -- e.g. 'reading_part5', 'uoe_part4_kwt', 'listening_part2'
  content jsonb not null,              -- prompt, base text, options, etc. (shape depends on part_type)
  correct_answer text not null,
  explanation text,
  difficulty_estimate text,            -- 'B2' | 'C1' | 'C2'
  status review_status not null default 'draft',
  generator_model text,                -- model/prompt version that produced this item
  blind_solver_answer text,            -- answer from the independent "blind solver" pass
  audit_notes jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles (id)
);

create index question_bank_skill_status_idx on question_bank (skill, status);

alter table question_bank enable row level security;

-- Everyone authenticated can read approved questions (what /practice uses).
create policy "students read approved questions"
  on question_bank for select
  using (status = 'approved');

-- Admins have full access (review queue, generation pipeline).
create policy "admin full access to question_bank"
  on question_bank for all
  using (public.is_admin())
  with check (public.is_admin());
