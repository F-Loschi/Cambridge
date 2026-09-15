/** Whole days between today and the exam date (negative if it already passed). */
export function daysUntilExam(examDate: string | null, now: Date = new Date()): number | null {
  if (!examDate) return null;

  const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  const target = new Date(`${examDate}T00:00:00Z`);
  const diffMs = target.getTime() - today.getTime();

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
