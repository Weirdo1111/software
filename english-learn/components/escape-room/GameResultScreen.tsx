"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, RotateCcw, ShieldCheck, TimerOff, Trophy } from "lucide-react";

type ResultMode = "success" | "failed";

export function GameResultScreen({
  mode,
  locale,
  rank,
  xpEarned,
  badgeUnlocked,
  elapsedLabel,
  bestLabel,
  countdownLabel,
  failureReason,
  onRetry,
}: {
  mode: ResultMode;
  locale: "zh" | "en";
  rank: string;
  xpEarned: number;
  badgeUnlocked: string | null;
  elapsedLabel: string;
  bestLabel: string;
  countdownLabel: string;
  failureReason?: "timer" | "attempts";
  onRetry: () => void;
}) {
  const success = mode === "success";

  const copy = {
    successTitle: "Midnight Library Cleared",
    successBody: "You completed the official stage. Your clear time, rank, and rewards have been recorded locally.",
    failTitle: failureReason === "attempts" ? "Security Lock Reset" : "Countdown Expired",
    failBody:
      failureReason === "attempts"
        ? "You exceeded the allowed number of wrong keypad attempts. Reset the run and regroup your library clues."
        : "You ran out of time before clearing the library. Restart the stage and try a cleaner route.",
    back: "Back to Game Center",
    retry: "Retry Run",
    cleared: "Stage Result",
    failed: "Run Failed",
    time: "Clear time",
    best: "Best clear",
    left: "Time left",
    badge: "Badge",
    reward: "Reward",
    rank: "Rank",
  };

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-[rgba(3,8,16,0.84)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,211,197,0.18),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(255,209,102,0.18),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(44,140,255,0.2),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full overflow-hidden rounded-[2.2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(8,18,30,0.98),rgba(12,30,48,0.94))] shadow-[0_40px_120px_rgba(0,0,0,0.42)]">
          <div className={`h-2 w-full ${success ? "bg-[linear-gradient(90deg,#19d3c5,#2c8cff,#ffd166)]" : "bg-[linear-gradient(90deg,#f59e0b,#ef4444,#fb7185)]"}`} />

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[2rem] border border-white/12 bg-white/6 p-6">
              <div className="rank-burst relative mx-auto flex size-44 items-center justify-center rounded-full border border-white/12 bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] shadow-[0_20px_60px_rgba(0,0,0,0.26)]">
                <div className={`rank-orb absolute inset-4 rounded-full border ${success ? "border-cyan-300/35" : "border-rose-300/30"}`} />
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{copy.rank}</p>
                  <p className="mt-2 text-6xl font-semibold tracking-tight text-white">{success ? rank : "R"}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-black/16 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.time}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{elapsedLabel}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-black/16 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.best}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{bestLabel}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-black/16 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.left}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{countdownLabel}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
                  {success ? <ShieldCheck className="size-4 text-emerald-300" /> : <AlertTriangle className="size-4 text-amber-200" />}
                  {success ? copy.cleared : copy.failed}
                </div>

                <h2 className="font-display mt-5 text-4xl tracking-tight text-white sm:text-5xl">
                  {success ? copy.successTitle : copy.failTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{success ? copy.successBody : copy.failBody}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                    <div className="flex items-center gap-2 text-cyan-200">
                      <Trophy className="size-4" />
                      <p className="text-sm font-semibold">{copy.reward}</p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">{success ? `+${xpEarned} XP` : "--"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <ShieldCheck className="size-4" />
                      <p className="text-sm font-semibold">{copy.badge}</p>
                    </div>
                    <p className="mt-3 text-xl font-semibold text-white">{success ? badgeUnlocked : "Retry required"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                    <div className="flex items-center gap-2 text-amber-200">
                      {success ? <Trophy className="size-4" /> : <TimerOff className="size-4" />}
                      <p className="text-sm font-semibold">{copy.rank}</p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">{success ? rank : "Retry"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
                >
                  <RotateCcw className="size-4" />
                  {copy.retry}
                </button>

                <Link
                  href={`/games?lang=${locale}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  {copy.back}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
