"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Lock, Trophy } from "lucide-react";

import { officialGameLevels } from "@/components/escape-room/game-center-data";
import { formatGameTime } from "@/components/escape-room/time-utils";
import type { Locale } from "@/lib/i18n/dictionaries";
import type {
  EscapeRoomLeaderboardEntry,
  EscapeRoomRunHistoryEntry,
  EscapeRoomStageRecord,
} from "@/lib/escape-room-stage-progress";

type OverviewPayload = {
  stages: EscapeRoomStageRecord[];
  history: EscapeRoomRunHistoryEntry[];
  leaderboards: Partial<Record<"library" | "dorm" | "station", EscapeRoomLeaderboardEntry[]>>;
};

const STAGE_COPY = {
  library: "Library",
  dorm: "Dorm",
  station: "Station",
} as const;

function formatEndedAt(iso: string) {
  const value = new Date(iso);

  if (Number.isNaN(value.getTime())) {
    return "--";
  }

  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRunResult(result: string) {
  if (result === "cleared") return "Cleared";
  if (result === "failed") return "Failed";
  return "Abandoned";
}

function getRunTone(result: string) {
  if (result === "cleared") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (result === "failed") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

export function GameCenterHub({ locale }: { locale: Locale }) {
  const [overview, setOverview] = useState<OverviewPayload>({
    stages: [],
    history: [],
    leaderboards: {},
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        const response = await fetch("/api/games/escape-room/overview", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as Partial<OverviewPayload>;
        if (cancelled) {
          return;
        }

        setOverview({
          stages: payload.stages ?? [],
          history: payload.history ?? [],
          leaderboards: payload.leaderboards ?? {},
        });
      } catch {
        // Keep the hub usable even when the database overview is unavailable.
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  const stageRecordMap = useMemo(
    () => new Map(overview.stages.map((record) => [record.stageSlug, record] as const)),
    [overview.stages],
  );

  const bestSeconds = useMemo(() => {
    const values = overview.stages
      .map((record) => record.bestSeconds)
      .filter((value): value is number => typeof value === "number");

    return values.length ? Math.min(...values) : null;
  }, [overview.stages]);

  const resumeCount = overview.stages.filter((record) => record.started && !record.escaped).length;

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef5ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.28),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.22),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(96,165,250,0.14),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1480px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/?lang=${locale}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            Back Home
          </Link>

          <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">
            Escape Room
          </span>
        </div>

        <section className="rounded-[2rem] border border-[#d7e6fb] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95))] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.12)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700/76">Game Center</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-5xl leading-[0.94] tracking-tight text-slate-900 sm:text-6xl">Escape Room</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Continue a saved run, check the fastest clears, or start a fresh stage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-medium text-slate-700">
                Best clear <span className="ml-2 font-semibold text-slate-900">{bestSeconds === null ? "--:--" : formatGameTime(bestSeconds)}</span>
              </div>
              <div className="rounded-full border border-[#d7e6fb] bg-white/92 px-4 py-2 text-sm font-medium text-slate-700">
                Active runs <span className="ml-2 font-semibold text-slate-900">{resumeCount}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {officialGameLevels.map((level) => {
            const live = level.status === "live";
            const href = level.href ? `${level.href}?lang=${locale}` : "#";
            const stageRecord = level.stageSlug ? stageRecordMap.get(level.stageSlug) : undefined;
            const hasResume = Boolean(stageRecord?.started && !stageRecord.escaped);

            return (
              <article
                key={level.id}
                className="overflow-hidden rounded-[1.8rem] border border-[#d7e6fb] bg-white/94 shadow-[0_18px_44px_rgba(37,99,235,0.1)]"
              >
                <div className="relative">
                  <div
                    className="h-48 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${level.cover}')` }}
                  />
                  <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${level.accent} opacity-20`} />
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{level.title}</p>
                      <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-900">{level.subtitle}</h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        live ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {hasResume ? "Resume" : live ? "Live" : "Locked"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#d7e6fb] bg-[#f8fbff] px-3 py-1.5 text-sm text-slate-700">{level.difficulty}</span>
                    <span className="rounded-full border border-[#d7e6fb] bg-[#f8fbff] px-3 py-1.5 text-sm text-slate-700">{level.duration}</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-[1rem] border border-[#d7e6fb] bg-[#f8fbff] px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Best</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {stageRecord?.bestSeconds ? formatGameTime(stageRecord.bestSeconds) : "--:--"}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[#d7e6fb] bg-[#f8fbff] px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Clears</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">{stageRecord?.clearCount ?? 0}</p>
                    </div>
                    <div className="rounded-[1rem] border border-[#d7e6fb] bg-[#f8fbff] px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">State</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">{hasResume ? "Saved" : "Ready"}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{level.mission}</p>

                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-[#f8fbff] px-3 py-1.5 text-sm font-medium text-slate-700">
                      <Trophy className="size-4 text-blue-700" />
                      {level.reward}
                    </div>

                    {live ? (
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1c4e95] px-4 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                      >
                        {hasResume ? "Resume" : "Start"}
                        <ArrowRight className="size-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
                        <Lock className="size-4" />
                        Preview
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[1.8rem] border border-[#d7e6fb] bg-white/94 p-5 shadow-[0_18px_44px_rgba(37,99,235,0.1)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Stage leaders</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best clears</span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {officialGameLevels.map((level) => {
                const stageSlug = level.stageSlug;
                const rows = stageSlug ? (overview.leaderboards[stageSlug] ?? []).slice(0, 3) : [];

                return (
                  <article key={level.id} className="rounded-[1.4rem] border border-[#d7e6fb] bg-[#f8fbff] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{level.title}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{level.subtitle}</h3>

                    <div className="mt-4 space-y-2.5">
                      {rows.length ? (
                        rows.map((entry, index) => (
                          <div
                            key={`${stageSlug}-${entry.userDisplayName}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-[1rem] border border-[#d7e6fb] bg-white px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {index + 1}. {entry.userDisplayName}
                              </p>
                              <p className="text-xs text-slate-500">{entry.clearCount} clears</p>
                            </div>
                            <span className="text-sm font-semibold text-blue-700">{formatGameTime(entry.bestSeconds)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-[1rem] border border-dashed border-[#d7e6fb] px-3 py-4 text-sm text-slate-500">No clears yet.</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[#d7e6fb] bg-white/94 p-5 shadow-[0_18px_44px_rgba(37,99,235,0.1)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Latest runs</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">History</span>
            </div>

            <div className="mt-5 space-y-3">
              {overview.history.length ? (
                overview.history.map((run) => (
                  <article key={run.id} className="rounded-[1.3rem] border border-[#d7e6fb] bg-[#f8fbff] px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{STAGE_COPY[run.stageSlug]}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatEndedAt(run.endedAt)}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getRunTone(run.result)}`}>
                        {formatRunResult(run.result)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                      <span className="rounded-full border border-[#d7e6fb] bg-white px-3 py-1.5">
                        {run.elapsedSeconds === null ? "--:--" : formatGameTime(run.elapsedSeconds)}
                      </span>
                      <span className="rounded-full border border-[#d7e6fb] bg-white px-3 py-1.5">
                        {run.keypadAttempts} attempts
                      </span>
                      <span className="rounded-full border border-[#d7e6fb] bg-white px-3 py-1.5">+{run.rewardXp} XP</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-[1.3rem] border border-dashed border-[#d7e6fb] px-4 py-8 text-sm text-slate-500">No run history yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
