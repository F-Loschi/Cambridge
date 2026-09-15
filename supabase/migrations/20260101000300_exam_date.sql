-- Each user sets their own exam date; the dashboard countdown reads it.
alter table profiles add column exam_date date;
