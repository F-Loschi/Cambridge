import { Flame } from "lucide-react";

export function StreakFlame({ streak, size = "lg" }: { streak: number; size?: "sm" | "lg" }) {
  const big = size === "lg";
  const isHot = streak >= 7;
  const active = streak > 0;

  return (
    <div className={`flex items-center ${big ? "gap-2.5" : "gap-1.5"}`}>
      <Flame
        size={big ? 34 : 20}
        strokeWidth={2.25}
        className={isHot ? "animate-flame" : ""}
        style={{
          color: active ? "var(--color-streak)" : "var(--muted)",
          fill: active ? "var(--color-streak)" : "none",
          fillOpacity: active ? 0.25 : 0,
        }}
      />
      <span
        className={`font-display font-extrabold ${big ? "text-4xl" : "text-lg"}`}
        style={{ color: active ? "var(--color-streak)" : "var(--muted)" }}
      >
        {streak}
      </span>
    </div>
  );
}
