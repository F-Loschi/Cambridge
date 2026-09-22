-- Daily goal, streak shields (forgive one missed day), and per-day question
-- counts (distinct from attempts_count, which counts sessions not items).

alter table profiles add column streak_shields int not null default 1;
alter table profiles add column last_shield_milestone int not null default 0;
alter table profiles add column daily_goal_questions int not null default 5;

alter table daily_activity add column questions_answered int not null default 0;
