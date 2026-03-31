"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n/dictionaries";

export function GameSelectorModal({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<"escape-room" | "word-game">("escape-room");

  const copy = useMemo(
    () =>
      locale === "zh"
        ? {
            title: "选择要进入的游戏",
            subtitle: "点击游戏中心后先在这里选择，再进入对应游戏。",
            escapeRoom: "密室逃脱游戏",
            wordGame: "Word Game",
            enter: "进入所选游戏",
            back: "返回首页",
          }
        : {
            title: "Choose Your Game",
            subtitle: "After opening Game Center, pick one game first, then continue.",
            escapeRoom: "Escape Room",
            wordGame: "Word Game",
            enter: "Enter Selected Game",
            back: "Back Home",
          },
    [locale],
  );

  const selectedHref = selectedGame === "escape-room" ? `/games/escape-room?lang=${locale}` : `/games/word-game?lang=${locale}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eaf2ff] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(147,197,253,0.25),transparent_28%),radial-gradient(circle_at_85%_14%,rgba(191,219,254,0.22),transparent_24%)]" />

      <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#d7e6fb] bg-white/80 p-6 shadow-[0_28px_70px_rgba(37,99,235,0.12)] backdrop-blur-sm sm:p-8">
        <div className="mx-auto max-w-xl rounded-[1.8rem] border border-[#d7e6fb] bg-white p-6 shadow-[0_18px_40px_rgba(37,99,235,0.14)] sm:p-7">
          <div className="flex items-center gap-2 text-[#1c4e95]">
            <Gamepad2 className="size-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Game Center</p>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">{copy.subtitle}</p>

          <select
            value={selectedGame}
            onChange={(event) => setSelectedGame(event.target.value as "escape-room" | "word-game")}
            className="mt-6 w-full rounded-xl border border-[#cfe0f8] bg-white px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-blue-400"
          >
            <option value="escape-room">{copy.escapeRoom}</option>
            <option value="word-game">{copy.wordGame}</option>
          </select>

          <button
            type="button"
            onClick={() => router.push(selectedHref)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c4e95] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#163f79]"
          >
            {copy.enter}
            <ArrowRight className="size-4" />
          </button>

          <Link
            href={`/?lang=${locale}`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#d7e6fb] bg-[#f8fbff] px-4 py-2.5 text-sm font-semibold text-[#1c4e95] transition hover:bg-white"
          >
            {copy.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
