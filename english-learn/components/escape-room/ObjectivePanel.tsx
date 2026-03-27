import { BookOpen, CheckCircle2, LockKeyhole, Monitor, ScrollText, Volume2 } from "lucide-react";

import type { GameProgress, ProgressTask } from "@/components/escape-room/types";

const iconMap = {
  "notice-board": ScrollText,
  bookshelf: BookOpen,
  speaker: Volume2,
  "librarian-desk-terminal": Monitor,
  quiz: LockKeyhole,
} as const;

const phaseLabels: Record<GameProgress["phase"], string> = {
  intro: "Briefing",
  exploring: "Exploring",
  "audio-complete": "Broadcast solved",
  "dialogue-complete": "Librarian hint unlocked",
  "quiz-complete": "Etiquette cleared",
  "ready-to-unlock": "Ready to unlock",
  escaped: "Escaped",
};

export function ObjectivePanel({
  progress,
  tasks,
  completionPercent,
}: {
  progress: GameProgress;
  tasks: ProgressTask[];
  completionPercent: number;
}) {
  const completedCount = tasks.filter((task) => progress.completedPuzzles[task.id]).length;

  return (
    <section className="surface-panel rounded-[2rem] p-5 sm:p-6">
      <p className="section-label institution-label">Objective</p>
      <h3 className="font-display mt-3 text-2xl tracking-tight text-[var(--ink)]">Quest Progress</h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{phaseLabels[progress.phase]}</p>

      <div className="mt-5 rounded-[1.4rem] border border-[rgba(20,50,75,0.1)] bg-white/68 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Current mission</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink)]">{progress.currentObjective}</p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-medium text-[var(--ink)]">
          <span>Core puzzle progress</span>
          <span>{completionPercent}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200/70">
          <div
            className="progress-stripe h-full rounded-full bg-[linear-gradient(90deg,var(--navy),#28a6b5,#7ccf8a)] transition-[width] duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">{completedCount} of 5 required steps completed.</p>
      </div>

      <div className="mt-5 space-y-3">
        {tasks.map((task) => {
          const Icon = iconMap[task.id];
          const done = progress.completedPuzzles[task.id];

          return (
            <div
              key={task.id}
              className="flex gap-3 rounded-[1.3rem] border border-[rgba(20,50,75,0.1)] bg-white/60 p-3.5 transition"
            >
              <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold tracking-tight text-[var(--ink)]">{task.label}</span>
                <span className="mt-1 block text-sm leading-6 text-[var(--ink-soft)]">{task.supportText}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
