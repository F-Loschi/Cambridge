import { describe, expect, it } from "vitest";
import { formatMMSS } from "./time";

describe("formatMMSS", () => {
  it("pads seconds under 10", () => {
    expect(formatMMSS(65)).toBe("1:05");
  });

  it("formats an exact minute", () => {
    expect(formatMMSS(120)).toBe("2:00");
  });

  it("handles minutes over an hour without special-casing", () => {
    expect(formatMMSS(90 * 60)).toBe("90:00");
  });

  it("clamps negative values to 0:00", () => {
    expect(formatMMSS(-5)).toBe("0:00");
  });
});
