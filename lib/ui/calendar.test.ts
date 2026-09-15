import { describe, expect, it } from "vitest";
import { formatDateLong, getMonthMatrix } from "./calendar";

describe("getMonthMatrix", () => {
  it("produces only full weeks of 7 days", () => {
    const weeks = getMonthMatrix(2026, 8); // September 2026
    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }
  });

  it("lists every day of the month exactly once, in order, marked in-month", () => {
    const year = 2026;
    const month = 1; // February (leap-year-agnostic check below)
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const weeks = getMonthMatrix(year, month);
    const inMonthDays = weeks.flat().filter((c) => c.inCurrentMonth);

    expect(inMonthDays).toHaveLength(daysInMonth);
    inMonthDays.forEach((cell, i) => {
      expect(cell.date.getUTCDate()).toBe(i + 1);
    });
  });

  it("starts the first in-month cell on the real weekday of the 1st", () => {
    const year = 2027;
    const month = 5; // June
    const weeks = getMonthMatrix(year, month);
    const firstInMonthIndex = weeks.flat().findIndex((c) => c.inCurrentMonth);
    const expectedWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();

    expect(firstInMonthIndex % 7).toBe(expectedWeekday);
  });

  it("produces a continuous run of dates with no gaps or duplicates", () => {
    const cells = getMonthMatrix(2026, 11).flat(); // December 2026 (crosses year boundary)
    for (let i = 1; i < cells.length; i++) {
      const prev = cells[i - 1].date.getTime();
      const curr = cells[i].date.getTime();
      expect(curr - prev).toBe(24 * 60 * 60 * 1000);
    }
  });
});

describe("formatDateLong", () => {
  it("formats an ISO date in pt-BR long form", () => {
    expect(formatDateLong("2027-03-15")).toBe("15 de março de 2027");
  });
});
