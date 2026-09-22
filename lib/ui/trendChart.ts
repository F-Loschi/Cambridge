export interface TrendPoint {
  x: number;
  y: number;
  date: string;
  score: number;
}

/** Maps scored attempts (sorted by date) onto an SVG-space polyline, clamped to the scale range. */
export function buildTrendPoints(
  attempts: { scaled_score: number | null; started_at: string }[],
  scaleMin: number,
  scaleMax: number,
  width: number,
  height: number,
): TrendPoint[] {
  const scored = attempts
    .filter((a): a is { scaled_score: number; started_at: string } => a.scaled_score != null)
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());

  if (scored.length === 0) return [];

  return scored.map((a, i) => {
    const x = scored.length === 1 ? width / 2 : (i / (scored.length - 1)) * width;
    const clamped = Math.min(scaleMax, Math.max(scaleMin, a.scaled_score));
    const y = height - ((clamped - scaleMin) / (scaleMax - scaleMin)) * height;
    return { x, y, date: a.started_at, score: a.scaled_score };
  });
}

export function pointsToPolyline(points: TrendPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}
