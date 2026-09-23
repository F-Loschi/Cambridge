import { describe, expect, it } from "vitest";
import { rankForStreak } from "./streakRank";

describe("rankForStreak", () => {
  it("starts at Calouro on day 1", () => {
    expect(rankForStreak(1).title).toBe("Calouro");
  });

  it("advances exactly at each bracket's lower bound", () => {
    expect(rankForStreak(2).title).toBe("Aprendiz");
    expect(rankForStreak(3).title).toBe("Leitor Dedicado");
    expect(rankForStreak(5).title).toBe("Leitor Dedicado"); // still within 3-5
    expect(rankForStreak(6).title).toBe("Caçador de Vocabulário");
    expect(rankForStreak(29).title).toBe("Rei do Inglês");
  });

  it("reaches the permanent top rank at day 30 and stays there beyond it", () => {
    expect(rankForStreak(30).title).toBe("Iluminado");
    expect(rankForStreak(365).title).toBe("Iluminado");
  });

  it("has a distinct pre-streak state for 0 days", () => {
    expect(rankForStreak(0).title).toBe("Pronto pra começar");
  });
});
