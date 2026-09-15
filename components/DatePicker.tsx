"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  formatDateLong,
  getMonthMatrix,
  MONTH_LABELS_PT,
  toISODate,
  WEEKDAY_LABELS_PT,
} from "@/lib/ui/calendar";

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecionar data",
}: {
  value: string; // "" for unset, else YYYY-MM-DD
  onChange: (iso: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const initial = value ? new Date(`${value}T00:00:00Z`) : new Date();
  const [viewYear, setViewYear] = useState(initial.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getUTCMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  const weeks = getMonthMatrix(viewYear, viewMonth);
  const todayIso = toISODate(new Date());

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm outline-none focus:border-brand"
      >
        <CalendarDays size={16} className="shrink-0 text-muted" />
        {value ? formatDateLong(value) : <span className="text-muted">{placeholder}</span>}
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-72 rounded-2xl border border-border bg-surface p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-full p-1.5 text-muted hover:bg-border/60"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-sm font-bold">
              {MONTH_LABELS_PT[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-full p-1.5 text-muted hover:bg-border/60"
              aria-label="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS_PT.map((label, i) => (
              <p key={i} className="text-center text-[10px] font-bold text-muted">
                {label}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((cell) => {
              const isSelected = cell.iso === value;
              const isToday = cell.iso === todayIso;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => {
                    onChange(cell.iso);
                    setOpen(false);
                  }}
                  className={`aspect-square rounded-xl text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-brand text-white"
                      : isToday
                        ? "border border-brand text-brand"
                        : cell.inCurrentMonth
                          ? "text-foreground hover:bg-border/60"
                          : "text-muted/40"
                  }`}
                >
                  {cell.date.getUTCDate()}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold text-muted hover:bg-border/60"
            >
              <X size={12} /> Limpar data
            </button>
          )}
        </div>
      )}
    </div>
  );
}
