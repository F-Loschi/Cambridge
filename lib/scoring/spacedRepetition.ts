// Lightweight SM-2-style scheduler. Only wrong answers enter the review
// queue in the first place (see app/api/attempts/submit) — this just decides
// how far to push the next due date once an item is in it.

export interface ReviewState {
  intervalDays: number;
  ease: number;
}

export const INITIAL_REVIEW_STATE: ReviewState = { intervalDays: 1, ease: 2.5 };

export function nextReviewState(current: ReviewState, wasCorrect: boolean): ReviewState {
  if (!wasCorrect) {
    return { intervalDays: 1, ease: round2(Math.max(1.3, current.ease - 0.2)) };
  }

  let intervalDays: number;
  if (current.intervalDays <= 1) intervalDays = 3;
  else if (current.intervalDays <= 3) intervalDays = 7;
  else intervalDays = Math.round(current.intervalDays * current.ease);

  return { intervalDays, ease: round2(Math.min(2.8, current.ease + 0.05)) };
}

export function dueDateAfter(intervalDays: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + intervalDays);
  return d.toISOString().slice(0, 10);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
