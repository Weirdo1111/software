"use client";

import { Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function StreakCombo({ days }: { days: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const step = Math.max(1, Math.floor(days / 14));
    const timer = setInterval(() => {
      setDisplay((prev) => {
        if (prev + step >= days) {
          clearInterval(timer);
          return days;
        }
        return prev + step;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [days]);

  const badge = useMemo(() => {
    if (days >= 21) return "Legend";
    if (days >= 14) return "Hot";
    if (days >= 7) return "On Fire";
    return "Starter";
  }, [days]);

  return (
    <article className="combo-pulse relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-200 via-amber-100 to-rose-100 p-5 shadow-[0_18px_35px_rgba(251,146,60,0.28)]">
      <div className="absolute -right-7 -top-7 size-24 rounded-full bg-white/35 blur-2xl" aria-hidden />
      <p className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
        <Flame className="size-3.5" /> Streak Combo
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{display} days</p>
      <p className="mt-1 text-sm text-black/65">Badge: {badge}</p>
      <p className="mt-3 text-xs text-black/55">Keep one session/day to preserve your combo multiplier.</p>
    </article>
  );
}
