import { CheckCircle2, KeyRound, PackageOpen, RotateCcw, ScanSearch, ShieldCheck } from "lucide-react";

import type { GameProgress, ProgressTask } from "@/components/escape-room/types";

export function GameSidebar({
  progress,
  tasks,
  completionPercent,
  bestLabel,
  onStart,
  onReset,
  onOpenGate,
  itemsPlaceholder = "Physical evidence like slips, keys, and procedure cards will appear here.",
  intelPlaceholder = "Section and format intel will appear here",
  notesPlaceholder = "Board notes, cart leads, drawer procedures, and PA confirmations will appear here.",
  footerNote = "The final code is not enough on its own. The drawer card, PA order, and floor-map format must all agree.",
}: {
  progress: GameProgress;
  tasks: ProgressTask[];
  completionPercent: number;
  bestLabel: string;
  onStart: () => void;
  onReset: () => void;
  onOpenGate: () => void;
  itemsPlaceholder?: string;
  intelPlaceholder?: string;
  notesPlaceholder?: string;
  footerNote?: string;
}) {
  const codeClues = progress.inventory.clues.filter((clue) => clue.kind === "code");
  const intelClues = progress.inventory.clues.filter((clue) => clue.kind === "intel");

  return (
    <aside className="grid gap-4 xl:max-h-[calc(100vh-136px)] xl:overflow-y-auto">
      <section className="rounded-[1.8rem] border border-[#e8dcc7] bg-[linear-gradient(150deg,rgba(255,252,245,0.98),rgba(248,242,230,0.96))] p-5 text-slate-900 shadow-[0_26px_70px_rgba(80,60,20,0.12)]">
        <div className="flex items-center gap-2">
          <ScanSearch className="size-4 text-teal-700" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700/74">HUD</p>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Objective</p>
        <p className="mt-2 text-sm leading-7 text-slate-700">{progress.currentObjective}</p>
        <div className="mt-4 inline-flex rounded-full border border-[#e1dac8] bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
          Campus investigation
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Progress</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#eadfcb]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#19d3c5,#2c8cff,#ffd166)] transition-[width] duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Best {bestLabel}</p>
        </div>

        <div className="mt-5 grid gap-3">
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
            className="rounded-full border border-teal-300 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
          >
            Gate
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ddd7ca] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-[#e8dcc7] bg-[linear-gradient(150deg,rgba(255,252,246,0.98),rgba(246,239,226,0.96))] p-5 text-slate-900 shadow-[0_26px_70px_rgba(80,60,20,0.12)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Core tasks</p>
        </div>

        <div className="mt-4 space-y-3">
          {tasks.map((task) => {
            const done = progress.completedPuzzles[task.id];

            return (
              <div key={task.id} className="rounded-[1.3rem] border border-[#e6ded0] bg-white/80 p-3.5">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    <CheckCircle2 className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-slate-900">{task.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{task.supportText}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-[#e8dcc7] bg-[linear-gradient(150deg,rgba(255,252,246,0.98),rgba(246,239,226,0.96))] p-5 text-slate-900 shadow-[0_26px_70px_rgba(80,60,20,0.12)]">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-teal-700" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Field kit</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Code fragments</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {codeClues.length ? (
              codeClues.map((clue) => (
                <span key={clue.id} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold tracking-[0.18em] text-teal-900">
                  {clue.value}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-1.5 text-sm text-slate-500">No number fragments yet</span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Collected items</p>
          <div className="mt-3 space-y-2">
            {progress.inventory.items.length ? (
              progress.inventory.items.map((item) => (
                <div key={item.id} className="rounded-[1.1rem] border border-[#e6ded0] bg-white/80 px-3 py-2.5 text-sm leading-6 text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">{item.label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${item.used ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                      {item.used ? "used" : "held"}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{item.value ? `${item.value} · ${item.description}` : item.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-[#d7d2c7] px-3 py-2.5 text-sm leading-6 text-slate-500">{itemsPlaceholder}</div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Format intel</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {intelClues.length ? (
              intelClues.map((clue) => (
                <span key={clue.id} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold tracking-[0.08em] text-amber-900">
                  {clue.value}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-1.5 text-sm text-slate-500">{intelPlaceholder}</span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Case notes</p>
          <div className="mt-3 space-y-2">
            {progress.inventory.notes.length ? (
              progress.inventory.notes.map((note) => (
                <div key={note} className="rounded-[1.1rem] border border-[#e6ded0] bg-white/80 px-3 py-2.5 text-sm leading-6 text-slate-700">
                  {note}
                </div>
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-[#d7d2c7] px-3 py-2.5 text-sm leading-6 text-slate-500">{notesPlaceholder}</div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-[1.2rem] border border-[#e6ded0] bg-white/80 px-3 py-3 text-sm text-slate-700">
          <PackageOpen className="size-4 text-teal-700" />
          {footerNote}
        </div>
      </section>
    </aside>
  );
}
