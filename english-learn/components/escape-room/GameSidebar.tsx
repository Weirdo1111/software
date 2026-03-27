import { CheckCircle2, KeyRound, RotateCcw, ScanSearch, ShieldCheck } from "lucide-react";

import type { GameProgress, ProgressTask } from "@/components/escape-room/types";

export function GameSidebar({
  progress,
  tasks,
  completionPercent,
  bestLabel,
  onStart,
  onReset,
  onOpenGate,
}: {
  progress: GameProgress;
  tasks: ProgressTask[];
  completionPercent: number;
  bestLabel: string;
  onStart: () => void;
  onReset: () => void;
  onOpenGate: () => void;
}) {
  const codeClues = progress.inventory.clues.filter((clue) => clue.kind === "code");
  const intelClues = progress.inventory.clues.filter((clue) => clue.kind === "intel");

  return (
    <aside className="grid gap-4 xl:max-h-[calc(100vh-136px)] xl:overflow-y-auto">
      <section className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(150deg,rgba(15,26,43,0.95),rgba(10,18,29,0.96))] p-5 text-white shadow-[0_26px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2">
          <ScanSearch className="size-4 text-cyan-200" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/74">HUD</p>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Objective</p>
        <p className="mt-2 text-sm leading-7 text-slate-300">{progress.currentObjective}</p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm font-medium text-slate-200">
            <span>Progress</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#19d3c5,#2c8cff,#ffd166)] transition-[width] duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Best {bestLabel}</p>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
          >
            {progress.started ? "Resume" : "Start"}
          </button>
          <button
            type="button"
            onClick={onOpenGate}
            className="rounded-full border border-cyan-300/18 bg-cyan-300/8 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/12"
          >
            Gate
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(150deg,rgba(11,20,34,0.95),rgba(8,15,26,0.96))] p-5 text-white shadow-[0_26px_70px_rgba(0,0,0,0.26)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-300" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Core tasks</p>
        </div>

        <div className="mt-4 space-y-3">
          {tasks.map((task) => {
            const done = progress.completedPuzzles[task.id];

            return (
              <div key={task.id} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-3.5">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-500/18 text-emerald-300" : "bg-white/8 text-slate-400"}`}>
                    <CheckCircle2 className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-white">{task.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(150deg,rgba(11,20,34,0.95),rgba(8,15,26,0.96))] p-5 text-white shadow-[0_26px_70px_rgba(0,0,0,0.26)]">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-cyan-200" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Intel Pack</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Code fragments</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {codeClues.length ? (
              codeClues.map((clue) => (
                <span key={clue.id} className="rounded-full border border-cyan-300/16 bg-cyan-300/8 px-3 py-1.5 text-sm font-semibold tracking-[0.18em] text-cyan-100">
                  {clue.value}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-white/16 px-3 py-1.5 text-sm text-slate-300">No number fragments</span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Field intel</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {intelClues.length ? (
              intelClues.map((clue) => (
                <span key={clue.id} className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1.5 text-sm font-semibold tracking-[0.08em] text-amber-100">
                  {clue.value}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-white/16 px-3 py-1.5 text-sm text-slate-300">Map and cart intel will appear here</span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Case notes</p>
          <div className="mt-3 space-y-2">
            {progress.inventory.notes.length ? (
              progress.inventory.notes.map((note) => (
                <div key={note} className="rounded-[1.1rem] border border-white/10 bg-white/5 px-3 py-2.5 text-sm leading-6 text-slate-200">
                  {note}
                </div>
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-white/12 px-3 py-2.5 text-sm leading-6 text-slate-300">Broadcast, map, cart, and librarian notes appear here.</div>
            )}
          </div>
        </div>
      </section>
    </aside>
  );
}
