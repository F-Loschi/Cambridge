export function StreakFlame({ streak, size = "lg" }: { streak: number; size?: "sm" | "lg" }) {
  const big = size === "lg";
  const isHot = streak >= 7;

  return (
    <div className={`flex items-center ${big ? "gap-3" : "gap-1.5"}`}>
      <span
        className={isHot ? "animate-flame" : ""}
        style={{ fontSize: big ? "2.75rem" : "1.25rem", lineHeight: 1 }}
      >
        {streak > 0 ? "🔥" : "🪵"}
      </span>
      <span
        className={`font-display font-extrabold ${big ? "text-4xl" : "text-lg"}`}
        style={{ color: streak > 0 ? "var(--color-streak)" : "var(--muted)" }}
      >
        {streak}
      </span>
    </div>
  );
}
