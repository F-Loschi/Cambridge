import { buildHeatmapWeeks, intensityLevel } from "@/lib/ui/heatmap";

const LEVEL_OPACITY: Record<0 | 1 | 2 | 3 | 4, number> = {
  0: 0,
  1: 0.3,
  2: 0.55,
  3: 0.75,
  4: 1,
};

export function ActivityHeatmap({
  activity,
}: {
  activity: { activity_date: string; questions_answered: number }[];
}) {
  const weeks = buildHeatmapWeeks(activity, 12);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const level = intensityLevel(day.count);
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} questão${day.count === 1 ? "" : "ões"}`}
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor:
                      level === 0 ? "var(--border)" : "var(--color-success)",
                    opacity: level === 0 ? 1 : LEVEL_OPACITY[level],
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
