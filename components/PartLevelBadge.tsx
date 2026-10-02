import type { PartLevel, PartStat } from "@/lib/scoring/partStats";

const LEVEL_UI: Record<PartLevel, { label: string; className: string }> = {
  struggling: { label: "Dificuldade", className: "bg-danger/15 text-danger" },
  learning: { label: "Aprendendo", className: "bg-streak/20 text-streak-hot" },
  solid: { label: "Em dia", className: "bg-success/15 text-success" },
  no_data: { label: "Sem dados", className: "bg-border text-muted" },
};

export function PartLevelBadge({ level, stat }: { level: PartLevel; stat?: PartStat }) {
  const ui = LEVEL_UI[level];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${ui.className}`}>
      {ui.label}
      {stat && stat.total > 0 && (
        <span className="font-bold opacity-80">
          · {stat.correct}/{stat.total}
        </span>
      )}
    </span>
  );
}
