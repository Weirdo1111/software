import Link from "next/link";

import { getLocale } from "@/lib/i18n/get-locale";

export default async function WordGamePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "Word Game 首页",
          subtitle: "这里是你 Word Game 的接入占位页，下一步可以替换为你的真实首页内容。",
          back: "返回游戏中心",
        }
      : {
          title: "Word Game Home",
          subtitle: "This is the integration placeholder for your Word Game homepage. Next step: replace with your real game home.",
          back: "Back to Game Center",
        };

  return (
    <main className="min-h-screen bg-[#eef5ff] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[#d7e6fb] bg-white p-8 shadow-[0_22px_50px_rgba(37,99,235,0.12)]">
        <h1 className="text-4xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-3 text-base text-slate-700">{copy.subtitle}</p>
        <Link
          href={`/games?lang=${locale}`}
          className="mt-8 inline-flex items-center rounded-full border border-[#d7e6fb] bg-[#f8fbff] px-5 py-2.5 text-sm font-semibold text-[#1c4e95] transition hover:bg-white"
        >
          {copy.back}
        </Link>
      </div>
    </main>
  );
}
