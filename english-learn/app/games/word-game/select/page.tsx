import Link from "next/link";

import { getLocale } from "@/lib/i18n/get-locale";

export default async function WordGameSelectPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "词库选择（开发中）",
          desc: "这里将对接你原版 Word Game 的词库选择页面。下一步我们可以把 select.html 结构继续迁移进来。",
          backHome: "返回 Word Game 首页",
          backCenter: "返回游戏中心",
        }
      : {
          title: "Word Bank Selector (In Progress)",
          desc: "This page is reserved for integrating your original Word Game selector next.",
          backHome: "Back to Word Game Home",
          backCenter: "Back to Game Center",
        };

  return (
    <main className="min-h-screen bg-[#ecf6ff] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#d2e5fb] bg-white p-8 shadow-[0_22px_50px_rgba(23,75,150,0.12)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#183c7a] sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">{copy.desc}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/games/word-game?lang=${locale}`}
            className="inline-flex items-center rounded-xl bg-[#194d96] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153f7b]"
          >
            {copy.backHome}
          </Link>
          <Link
            href={`/games?lang=${locale}`}
            className="inline-flex items-center rounded-xl border border-[#cfe0f8] bg-[#f8fbff] px-5 py-2.5 text-sm font-semibold text-[#194d96] transition hover:bg-white"
          >
            {copy.backCenter}
          </Link>
        </div>
      </div>
    </main>
  );
}
