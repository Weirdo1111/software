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
    <main className="min-h-screen overflow-hidden bg-[#06101b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,211,197,0.16),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(255,209,102,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(44,140,255,0.2),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1560px] flex-col gap-8 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/?lang=${locale}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white/88 transition hover:bg-white/14"
          >
            {copy.backHome}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/88">
            <Gamepad2 className="size-4" />
            Quest Arcade
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="rounded-[2.2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(7,18,31,0.94),rgba(9,34,54,0.88))] p-6 shadow-[0_34px_90px_rgba(1,7,15,0.45)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-200/74">{copy.eyebrow}</p>
            <h1 className="font-display mt-4 text-5xl leading-[0.96] tracking-tight text-white sm:text-6xl">{copy.title}</h1>

            <div className="mt-6 flex flex-wrap gap-3">
              {copy.strip.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-cyan-400/18 bg-[linear-gradient(145deg,rgba(12,33,52,0.96),rgba(8,21,34,0.94))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-cyan-400/14 text-cyan-100">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/72">{copy.best}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-white">{bestSeconds === null ? "--:--" : formatGameTime(bestSeconds)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-black/18 p-5">
              <div className="flex items-center gap-2 text-cyan-100">
                <ScanSearch className="size-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Demo Day Loadout</p>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <p>1. Hotspot-based 2D rooms with modal puzzles</p>
                <p>2. Listening, clue collection, and keypad progression</p>
                <p>3. Polite-English dialogue tasks with a local AI librarian</p>
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
                className="group arcade-float relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(160deg,rgba(9,20,35,0.95),rgba(7,13,24,0.95))] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.34)]"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${level.accent}`} />
                <div className="absolute -right-10 top-8 size-32 rounded-full bg-white/6 blur-3xl transition duration-300 group-hover:scale-110" />
                <div className="arcade-cover-sweep pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 shadow-[0_24px_44px_rgba(0,0,0,0.28)]">
                    <div
                      className="h-48 w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
                      style={{ backgroundImage: `url('${level.cover}')` }}
                    />
                    <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${level.accent} opacity-25 blur-2xl`} />
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{level.title}</p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{level.subtitle}</h2>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        live ? "bg-emerald-500/12 text-emerald-200" : "bg-white/8 text-slate-300"
                      }`}
                    >
                      {live ? copy.live : copy.locked}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-slate-200">{level.difficulty}</span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-slate-200">{level.duration}</span>
                  </div>

                  <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
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
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
                    >
                      {copy.enter}
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-semibold text-slate-200">
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
