import { RotateCcw } from "lucide-react";

import type { GameProgress } from "@/components/escape-room/types";

export function GameSidebar({
  progress,
  onStart,
  onReset,
  onOpenGate,
}: {
  progress: GameProgress;
  onStart: () => void;
  onReset: () => void;
  onOpenGate: () => void;
}) {
  return (
    <section className="border-t border-[#d7e6fb] bg-[rgba(247,251,255,0.88)] px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4">
      <div className="grid gap-2.5 md:grid-cols-3">
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
        >
          {progress.started ? "Resume" : "Start"}
        </button>
        <button
          type="button"
          onClick={onOpenGate}
          className="rounded-full border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
        >
          Gate
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7e6fb] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
      </div>
    </section>
  );
}
