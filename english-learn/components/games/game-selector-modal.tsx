"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, DoorClosed, Gamepad2, Swords } from "lucide-react";
import { useMemo } from "react";

import type { Locale } from "@/lib/i18n/dictionaries";
type GameCardCopy = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
  chips: string[];
  icon: typeof DoorClosed;
  cta: string;
  accentClassName: string;
};

export function GameSelectorModal({ locale }: { locale: Locale }) {
  const copy = useMemo(
    () =>
      locale === "zh"
        ? {
            kicker: "游戏中心",
            back: "返回首页",
          }
        : {
            kicker: "Game Center",
            back: "Back Home",
          },
    [locale],
  );

  const games = useMemo<GameCardCopy[]>(
    () => [
      {
        eyebrow: locale === "zh" ? "剧情解谜" : "Story puzzle",
        title: locale === "zh" ? "Escape Room" : "Escape Room",
        description:
          locale === "zh"
            ? "调查线索、听广播、解密码，用一条完整路线逃出场景。"
            : "Follow clues, decode the route, and clear the room before time runs out.",
        href: `/games/escape-room?lang=${locale}`,
        image: "/game-center/escape-room-preview.png",
        chips: locale === "zh" ? ["线索调查", "音频机关", "密码门"] : ["Clue trail", "Audio puzzle", "Keypad unlock"],
        icon: DoorClosed,
        cta: locale === "zh" ? "进入 Escape Room" : "Enter Escape Room",
        accentClassName: "from-[#8cc8ff]/70 via-[#b7ddff]/28 to-transparent",
      },
      {
        eyebrow: locale === "zh" ? "快节奏闯关" : "Arcade round",
        title: locale === "zh" ? "Word Game" : "Word Game",
        description:
          locale === "zh"
            ? "在轻松又快节奏的战斗里做拼写和词义选择，守住核心。"
            : "Defend the tower with fast spelling and meaning decisions in a lighter arcade loop.",
        href: `/games/word-game?lang=${locale}`,
        image: "/game-center/word-game-preview.png",
        chips: locale === "zh" ? ["拼写", "词义", "即时反馈"] : ["Spelling", "Meaning", "Fast feedback"],
        icon: Swords,
        cta: locale === "zh" ? "进入 Word Game" : "Enter Word Game",
        accentClassName: "from-[#f3b7ff]/70 via-[#fbe1ff]/24 to-transparent",
      },
    ],
    [locale],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef4ff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,214,168,0.22),transparent_20%),radial-gradient(circle_at_85%_15%,rgba(151,197,255,0.24),transparent_24%),radial-gradient(circle_at_45%_100%,rgba(255,193,219,0.18),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(28,78,149,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(28,78,149,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/?lang=${locale}`}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-[rgba(255,255,255,0.82)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white"
          >
            {copy.back}
          </Link>

          <span className="section-label institution-label">
            <Gamepad2 className="size-3.5" />
            {copy.kicker}
          </span>
        </div>

        <section className="surface-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-7">
          <div className="absolute -right-10 top-4 size-40 rounded-full bg-[rgba(255,182,193,0.14)] blur-3xl" aria-hidden />
          <div className="absolute -left-12 bottom-0 size-48 rounded-full bg-[rgba(126,191,255,0.14)] blur-3xl" aria-hidden />

          <div className="grid gap-5 xl:grid-cols-2">
            {games.map((game) => {
              const Icon = game.icon;

              return (
                <article
                  key={game.title}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-white/90 bg-white/84 shadow-[0_20px_44px_rgba(100,130,180,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(100,130,180,0.18)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      sizes="(min-width: 1280px) 44vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      priority
                    />
                    <div className={`absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t ${game.accentClassName}`} />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/68 bg-[rgba(12,22,41,0.62)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      <Icon className="size-3.5" />
                      {game.eyebrow}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
                    <div>
                      <h2 className="font-display text-[2rem] tracking-tight text-[var(--ink)]">{game.title}</h2>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">{game.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {game.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-[var(--ink-soft)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={game.href}
                      className="mt-auto inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
                    >
                      {game.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
