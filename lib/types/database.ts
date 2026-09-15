// Hand-written types mirroring supabase/migrations/*.sql.
// Once the project is linked to a real Supabase project, replace/regenerate
// with `supabase gen types typescript --linked > lib/types/database.ts`.

export type UserRole = "admin" | "student";

export type Skill =
  | "reading_use_of_english"
  | "writing"
  | "listening"
  | "speaking";

export type ReviewStatus = "draft" | "approved" | "rejected" | "needs_human_review";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  exam_date: string | null; // YYYY-MM-DD
  created_at: string;
}

export interface QuestionBankItem {
  id: string;
  skill: Skill;
  part_type: string;
  content: Record<string, unknown>;
  correct_answer: string;
  explanation: string | null;
  difficulty_estimate: "B2" | "C1" | "C2" | null;
  status: ReviewStatus;
  generator_model: string | null;
  blind_solver_answer: string | null;
  audit_notes: Record<string, unknown> | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface Attempt {
  id: string;
  user_id: string;
  skill: Skill;
  started_at: string;
  finished_at: string | null;
  raw_score: number | null;
  scaled_score: number | null;
  ai_feedback: Record<string, unknown> | null;
  source: "practice" | "mock_test" | "writing_task" | "speaking_recording";
}

export interface AttemptItem {
  id: string;
  attempt_id: string;
  question_id: string | null;
  question_number: number | null;
  correct: boolean | null;
  user_answer: string | null;
  correct_answer: string | null;
}

export interface DailyActivity {
  user_id: string;
  activity_date: string; // YYYY-MM-DD
  minutes_studied: number;
  attempts_count: number;
}

export interface ReviewItem {
  id: string;
  user_id: string;
  question_id: string;
  interval_days: number;
  ease: number;
  due_at: string; // YYYY-MM-DD
  times_seen: number;
  times_correct: number;
  last_reviewed_at: string | null;
  created_at: string;
}
