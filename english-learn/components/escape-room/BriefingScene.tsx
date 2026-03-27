import { ArrowRight, Sparkles, TimerReset } from "lucide-react";

import { cn } from "@/lib/utils";

export function BriefingScene({
  started,
  elapsedLabel,
  countdownLabel,
  fullscreen = false,
  onStart,
}: {
  started: boolean;
  elapsedLabel: string;
  countdownLabel: string;
  fullscreen?: boolean;
  onStart: () => void;
}) {
  return (
    <section className="grid min-h-[64vh] gap-4 lg:grid-cols-[1.18fr_0.82fr]">
      <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(11,23,39,0.92),rgba(10,31,52,0.86))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/70">Official Stage 01</p>
        <h2 className="font-display mt-4 text-4xl tracking-tight text-white sm:text-5xl">Midnight Library Escape</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          The library has closed. Read the notices, inspect the history shelf, listen to the final broadcast, ask the AI librarian politely, and unlock the exit before the timer runs out.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mode</p>
            <p className="mt-2 text-lg font-semibold text-white">Solo Quest Run</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Clock</p>
            <p className="mt-2 text-lg font-semibold text-white">{countdownLabel}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Run {elapsedLabel}</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Reward</p>
            <p className="mt-2 text-lg font-semibold text-white">+50 XP</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-slate-200">
          <div className="rounded-full border border-cyan-400/16 bg-cyan-400/8 px-4 py-2">Notice Board</div>
          <div className="rounded-full border border-cyan-400/16 bg-cyan-400/8 px-4 py-2">Bookshelf</div>
          <div className="rounded-full border border-cyan-400/16 bg-cyan-400/8 px-4 py-2">Broadcast</div>
          <div className="rounded-full border border-cyan-400/16 bg-cyan-400/8 px-4 py-2">Librarian</div>
          <div className="rounded-full border border-cyan-400/16 bg-cyan-400/8 px-4 py-2">Keypad</div>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-[2rem] border border-white/12 bg-[linear-gradient(150deg,rgba(18,29,47,0.96),rgba(9,18,31,0.94))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div>
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/24 shadow-[0_20px_44px_rgba(0,0,0,0.24)]">
            <div className="arcade-cover-sweep pointer-events-none absolute inset-0" />
            <div className="h-52 w-full bg-cover bg-center" style={{ backgroundImage: "url('/quests/escape-room/library.png')" }} />
          </div>
          <div className="mt-5 inline-flex size-14 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-100">
            <Sparkles className="size-6" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">Run Rules</h3>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <p>Hotspots only. No character movement.</p>
            <p>English unlocks the AI librarian hint.</p>
            <p>The final code is shelf first, then closing time.</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onStart}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full bg-white font-semibold text-slate-950 transition hover:translate-y-[-1px]",
              fullscreen ? "px-6 py-4 text-base" : "px-5 py-3 text-sm",
            )}
          >
            {started ? <TimerReset className="size-4" /> : <ArrowRight className="size-4" />}
            {started ? "Resume run" : "Start library run"}
          </button>
        </div>
      </div>
    </section>
  );
}
