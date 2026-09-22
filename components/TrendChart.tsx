import { CAMBRIDGE_SCALE } from "@/lib/scoring/scale";
import { buildTrendPoints, pointsToPolyline } from "@/lib/ui/trendChart";
import { SKILL_META, SKILL_ORDER } from "@/lib/ui/skills";
import type { Attempt } from "@/lib/types/database";

const WIDTH = 600;
const HEIGHT = 160;

export function TrendChart({ attempts }: { attempts: Pick<Attempt, "skill" | "scaled_score" | "started_at">[] }) {
  const bySkill = SKILL_ORDER.map((skill) => ({
    skill,
    meta: SKILL_META[skill],
    points: buildTrendPoints(
      attempts.filter((a) => a.skill === skill),
      CAMBRIDGE_SCALE.min,
      CAMBRIDGE_SCALE.max,
      WIDTH,
      HEIGHT,
    ),
  }));

  const hasAnyData = bySkill.some((s) => s.points.length > 0);

  if (!hasAnyData) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted">
        Complete algumas tentativas pra ver sua evolução aqui.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" preserveAspectRatio="none">
        {bySkill.map(
          ({ skill, meta, points }) =>
            points.length > 1 && (
              <polyline
                key={skill}
                points={pointsToPolyline(points)}
                fill="none"
                stroke={meta.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ),
        )}
        {bySkill.map(({ skill, meta, points }) =>
          points.map((p, i) => (
            <circle key={`${skill}-${i}`} cx={p.x} cy={p.y} r={3} fill={meta.color} />
          )),
        )}
      </svg>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {bySkill
          .filter((s) => s.points.length > 0)
          .map(({ skill, meta }) => (
            <span key={skill} className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.short}
            </span>
          ))}
      </div>
    </div>
  );
}
