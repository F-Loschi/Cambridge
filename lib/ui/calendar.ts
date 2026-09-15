export interface CalendarDay {
  date: Date;
  iso: string; // YYYY-MM-DD
  inCurrentMonth: boolean;
}

const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export const MONTH_LABELS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const WEEKDAY_LABELS_PT = ["D", "S", "T", "Q", "Q", "S", "S"];

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Weeks (Sun-Sat) covering `month` (0-11) of `year`, padded with adjacent-month days. */
export function getMonthMatrix(year: number, month: number): CalendarDay[][] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: CalendarDay[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month, -i));
    cells.push({ date: d, iso: toISODate(d), inCurrentMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(year, month, day));
    cells.push({ date: d, iso: toISODate(d), inCurrentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(
      Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate() + 1),
    );
    cells.push({ date: d, iso: toISODate(d), inCurrentMonth: false });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS_PT[m - 1]} de ${y}`;
}
