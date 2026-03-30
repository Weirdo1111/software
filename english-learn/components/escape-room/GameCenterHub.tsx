"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Gamepad2, Lock, ScanSearch, Trophy } from "lucide-react";

import { officialGameLevels } from "@/components/escape-room/game-center-data";
import { formatGameTime, ESCAPE_ROOM_BEST_TIME_KEY } from "@/components/escape-room/time-utils";
import type { Locale } from "@/lib/i18n/dictionaries";

export function GameCenterHub({ locale }: { locale: Locale }) {
  const [bestSeconds] = useState<number | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = window.localStorage.getItem(ESCAPE_ROOM_BEST_TIME_KEY);
    return stored ? Number(stored) : null;
  });

  const copy = {
    backHome: "Back Home",
    eyebrow: "Game Center",
    title: "Quest Arcade",
    strip: ["Official Levels", "Full Screen Ready", "Timer + Rewards"],
    live: "Live",
    locked: "Locked",
    mission: "Mission",
    reward: "Reward",
    enter: "Enter Stage",
    preview: "Preview only",
    best: "Best clear",
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef5ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,197,253,0.32),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(191,219,254,0.28),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(96,165,250,0.18),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1560px] flex-col gap-8 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/?lang=${locale}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            {copy.backHome}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-800">
            <Gamepad2 className="size-4 text-blue-700" />
            Quest Arcade
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="rounded-[2.2rem] border border-[#d7e6fb] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(238,246,255,0.95))] p-6 shadow-[0_28px_70px_rgba(37,99,235,0.12)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-blue-700/80">{copy.eyebrow}</p>
            <h1 className="font-display mt-4 text-5xl leading-[0.96] tracking-tight text-slate-900 sm:text-6xl">{copy.title}</h1>

            <div className="mt-6 flex flex-wrap gap-3">
              {copy.strip.map((item) => (
                <span key={item} className="rounded-full border border-[#d7e6fb] bg-white/90 px-4 py-2 text-sm text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#d7e6fb] bg-[linear-gradient(145deg,rgba(248,252,255,0.98),rgba(233,243,255,0.95))] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.1)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-blue-700/72">{copy.best}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{bestSeconds === null ? "--:--" : formatGameTime(bestSeconds)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-[#d7e6fb] bg-white/90 p-5">
              <div className="flex items-center gap-2 text-blue-800">
                <ScanSearch className="size-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Demo Day Loadout</p>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p>1. Hotspot-based 2D rooms with modal puzzles</p>
                <p>2. Sequenced clue chains with collected items and locked leads</p>
                <p>3. Listening, note-taking, and keypad deduction inside campus scenes</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {officialGameLevels.map((level) => {
            const live = level.status === "live";
            const href = level.href ? `${level.href}?lang=${locale}` : "#";

            return (
              <article
                key={level.id}
                className="group arcade-float relative overflow-hidden rounded-[2rem] border border-[#d7e6fb] bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(239,246,255,0.96))] p-5 shadow-[0_22px_50px_rgba(37,99,235,0.12)]"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${level.accent}`} />
                <div className="absolute -right-10 top-8 size-32 rounded-full bg-blue-200/30 blur-3xl transition duration-300 group-hover:scale-110" />
                <div className="arcade-cover-sweep pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="relative overflow-hidden rounded-[1.6rem] border border-[#d7e6fb] bg-white shadow-[0_18px_34px_rgba(37,99,235,0.08)]">
                    <div
                      className="h-48 w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
                      style={{ backgroundImage: `url('${level.cover}')` }}
                    />
                    <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${level.accent} opacity-25 blur-2xl`} />
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{level.title}</p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{level.subtitle}</h2>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        live ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {live ? copy.live : copy.locked}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#d7e6fb] bg-white/90 px-3 py-1.5 text-sm text-slate-700">{level.difficulty}</span>
                    <span className="rounded-full border border-[#d7e6fb] bg-white/90 px-3 py-1.5 text-sm text-slate-700">{level.duration}</span>
                  </div>

                  <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.mission}</p>
                      <p className="mt-1">{level.mission}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{copy.reward}</p>
                      <p className="mt-1">{level.reward}</p>
                    </div>
                  </div>

                  {live ? (
                    <Link
                      href={href}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1c4e95] px-4 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                    >
                      {copy.enter}
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d7e6fb] bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700">
                      <Lock className="size-4" />
                      {copy.preview}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
