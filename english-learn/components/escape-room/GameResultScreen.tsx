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
  successTitle = "Midnight Library Cleared",
  successBody = "You completed the official stage. Your clear time, rank, and rewards have been recorded locally.",
  failAttemptsTitle,
  failAttemptsBody,
  failTimerTitle,
  failTimerBody,
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
  successTitle?: string;
  successBody?: string;
  failAttemptsTitle?: string;
  failAttemptsBody?: string;
  failTimerTitle?: string;
  failTimerBody?: string;
}) {
  const success = mode === "success";

  const copy = {
    successTitle,
    successBody,
    failTitle:
      failureReason === "attempts"
        ? (failAttemptsTitle ?? "Security Lock Reset")
        : (failTimerTitle ?? "Countdown Expired"),
    failBody:
      failureReason === "attempts"
        ? (failAttemptsBody ?? "You exceeded the allowed number of wrong keypad attempts. Reset the run and regroup your library clues.")
        : (failTimerBody ?? "You ran out of time before clearing the library. Restart the stage and try a cleaner route."),
    back: "Back to stages",
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
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-[rgba(244,239,228,0.84)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,128,0.28),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(123,205,196,0.24),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(112,163,255,0.16),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full overflow-hidden rounded-[2.2rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.98),rgba(248,242,230,0.96))] shadow-[0_40px_120px_rgba(80,60,20,0.18)]">
          <div className={`h-2 w-full ${success ? "bg-[linear-gradient(90deg,#19d3c5,#2c8cff,#ffd166)]" : "bg-[linear-gradient(90deg,#f59e0b,#ef4444,#fb7185)]"}`} />

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[2rem] border border-[#e6decf] bg-white/84 p-6">
              <div className="rank-burst relative mx-auto flex size-44 items-center justify-center rounded-full border border-[#e6decf] bg-[radial-gradient(circle,rgba(255,255,255,0.92),rgba(244,239,228,0.86))] shadow-[0_20px_60px_rgba(80,60,20,0.12)]">
                <div className={`rank-orb absolute inset-4 rounded-full border ${success ? "border-teal-300/80" : "border-rose-300/70"}`} />
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">{copy.rank}</p>
                  <p className="mt-2 text-6xl font-semibold tracking-tight text-slate-900">{success ? rank : "R"}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.4rem] border border-[#e6decf] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.time}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{elapsedLabel}</p>
                </div>
                <div className="rounded-[1.4rem] border border-[#e6decf] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.best}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{bestLabel}</p>
                </div>
                <div className="rounded-[1.4rem] border border-[#e6decf] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.left}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{countdownLabel}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">
                  {success ? <ShieldCheck className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />}
                  {success ? copy.cleared : copy.failed}
                </div>

                <h2 className="font-display mt-5 text-4xl tracking-tight text-slate-900 sm:text-5xl">
                  {success ? copy.successTitle : copy.failTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">{success ? copy.successBody : copy.failBody}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-[#e6decf] bg-white/90 p-4">
                    <div className="flex items-center gap-2 text-teal-700">
                      <Trophy className="size-4" />
                      <p className="text-sm font-semibold">{copy.reward}</p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{success ? `+${xpEarned} XP` : "--"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#e6decf] bg-white/90 p-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <ShieldCheck className="size-4" />
                      <p className="text-sm font-semibold">{copy.badge}</p>
                    </div>
                    <p className="mt-3 text-xl font-semibold text-slate-900">{success ? badgeUnlocked : "Retry required"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#e6decf] bg-white/90 p-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      {success ? <Trophy className="size-4" /> : <TimerOff className="size-4" />}
                      <p className="text-sm font-semibold">{copy.rank}</p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{success ? rank : "Retry"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  <RotateCcw className="size-4" />
                  {copy.retry}
                </button>

                <Link
                  href={`/games/escape-room?lang=${locale}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ddd7ca] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
