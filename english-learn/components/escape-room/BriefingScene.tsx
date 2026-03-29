import { ArrowRight, Sparkles, TimerReset } from "lucide-react";

import { cn } from "@/lib/utils";

export function BriefingScene({
  started,
  elapsedLabel,
  countdownLabel,
  fullscreen = false,
  onStart,
  stageLabel = "Official Stage 01",
  title = "Midnight Library Escape",
  description = "The library has closed. Follow a real investigation chain: board, cart, stacks, circulation drawer, PA announcement, wall map, then the exit console.",
  difficulty = "Sequenced Campus Puzzle",
  reward = "+50 XP",
  featureChips = ["Zoomed Clues", "Physical Items", "Drawer Puzzle", "PA Listening", "Keypad Unlock"],
  rules = [
    "Hotspots only. No character movement.",
    "Some leads stay locked until earlier evidence is logged.",
    "Collect slips, keys, and procedure cards, not just raw numbers.",
  ],
  previewImage = "/quests/escape-room/library.png",
  startLabel,
  resumeLabel,
}: {
  started: boolean;
  elapsedLabel: string;
  countdownLabel: string;
  fullscreen?: boolean;
  onStart: () => void;
  stageLabel?: string;
  title?: string;
  description?: string;
  difficulty?: string;
  reward?: string;
  featureChips?: string[];
  rules?: string[];
  previewImage?: string;
  startLabel?: string;
  resumeLabel?: string;
}) {
  return (
    <section className="grid min-h-[64vh] gap-4 lg:grid-cols-[1.18fr_0.82fr]">
      <div className="rounded-[2rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.96),rgba(248,242,230,0.94))] p-6 shadow-[0_28px_80px_rgba(80,60,20,0.12)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700/70">{stageLabel}</p>
        <h2 className="font-display mt-4 text-4xl tracking-tight text-slate-900 sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">{description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.4rem] border border-[#e6decf] bg-white/88 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Difficulty</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{difficulty}</p>
          </div>
          <div className="rounded-[1.4rem] border border-[#e6decf] bg-white/88 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Clock</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{countdownLabel}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Run {elapsedLabel}</p>
          </div>
          <div className="rounded-[1.4rem] border border-[#e6decf] bg-white/88 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Reward</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{reward}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-slate-700">
          {featureChips.map((chip) => (
            <div key={chip} className="rounded-full border border-[#e6decf] bg-white/88 px-4 py-2">
              {chip}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-[2rem] border border-[#e8dcc7] bg-[linear-gradient(150deg,rgba(255,252,246,0.98),rgba(246,239,226,0.96))] p-6 shadow-[0_28px_80px_rgba(80,60,20,0.12)] sm:p-8">
        <div>
          <div className="relative overflow-hidden rounded-[1.8rem] border border-[#e8dcc7] bg-white shadow-[0_20px_44px_rgba(80,60,20,0.08)]">
            <div className="arcade-cover-sweep pointer-events-none absolute inset-0" />
            <div className="h-52 w-full bg-cover bg-center" style={{ backgroundImage: `url('${previewImage}')` }} />
          </div>
          <div className="mt-5 inline-flex size-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <Sparkles className="size-6" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Run Rules</h3>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            {rules.map((rule) => (
              <p key={rule}>{rule}</p>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onStart}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 font-semibold text-white transition hover:translate-y-[-1px]",
              fullscreen ? "px-6 py-4 text-base" : "px-5 py-3 text-sm",
            )}
          >
            {started ? <TimerReset className="size-4" /> : <ArrowRight className="size-4" />}
            {started ? (resumeLabel ?? "Resume run") : (startLabel ?? "Start library run")}
          </button>
        </div>
      </div>
    </section>
  );
}
