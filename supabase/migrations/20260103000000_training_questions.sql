-- Training questions: slightly easier (B2-level) exercises for the "Estudar"
-- section, kept apart from the exam-level questions used by normal practice
-- and mock tests.

alter table question_bank add column training boolean not null default false;

create index question_bank_training_idx on question_bank (part_type, training, status);
