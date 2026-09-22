import { describe, expect, it } from "vitest";
import { buildTrendPoints, pointsToPolyline } from "./trendChart";

describe("buildTrendPoints", () => {
  it("returns nothing when there are no scored attempts", () => {
    expect(buildTrendPoints([{ scaled_score: null, started_at: "2026-01-01" }], 140, 210, 100, 50)).toEqual([]);
  });

  it("centers a single point horizontally", () => {
    const points = buildTrendPoints([{ scaled_score: 175, started_at: "2026-01-01" }], 140, 210, 100, 50);
    expect(points).toHaveLength(1);
    expect(points[0].x).toBe(50);
  });

  it("sorts by date and spreads points evenly across the width", () => {
    const points = buildTrendPoints(
      [
        { scaled_score: 150, started_at: "2026-01-03" },
        { scaled_score: 160, started_at: "2026-01-01" },
        { scaled_score: 170, started_at: "2026-01-02" },
      ],
      140,
      210,
      100,
      50,
    );
    expect(points.map((p) => p.score)).toEqual([160, 170, 150]);
    expect(points.map((p) => p.x)).toEqual([0, 50, 100]);
  });

  it("maps a higher score to a smaller y (SVG y grows downward)", () => {
    const points = buildTrendPoints(
      [
        { scaled_score: 140, started_at: "2026-01-01" },
        { scaled_score: 210, started_at: "2026-01-02" },
      ],
      140,
      210,
      100,
      50,
    );
    expect(points[0].y).toBe(50); // min score -> bottom
    expect(points[1].y).toBe(0); // max score -> top
  });

  it("clamps out-of-range scores instead of drawing off the chart", () => {
    const points = buildTrendPoints([{ scaled_score: 999, started_at: "2026-01-01" }], 140, 210, 100, 50);
    expect(points[0].y).toBe(0);
  });
});

describe("pointsToPolyline", () => {
  it("joins points into an SVG points attribute string", () => {
    expect(pointsToPolyline([{ x: 0, y: 10, date: "", score: 0 }, { x: 5, y: 20, date: "", score: 0 }])).toBe(
      "0,10 5,20",
    );
  });
});
