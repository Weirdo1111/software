import Link from "next/link";

import { getLocale } from "@/lib/i18n/get-locale";

export default async function WordGameBattlePage({ searchParams }: { searchParams: Promise<{ lang?: string; bank?: string }> }) {
  const locale = await getLocale(searchParams);
  const params = await searchParams;
  const bank = params.bank ?? "general";

  return (
    <main className="min-h-screen bg-[#ecf6ff] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#d2e5fb] bg-white p-8 shadow-[0_22px_50px_rgba(23,75,150,0.12)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#183c7a] sm:text-4xl">Battle Scene Placeholder</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">Selected sector: <strong>{bank}</strong>. Next step is integrating your original battle page.</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/games/word-game/select?lang=${locale}`}
            className="inline-flex items-center rounded-xl bg-[#194d96] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153f7b]"
          >
            Back to Select
          </Link>
          <Link
            href={`/games/word-game?lang=${locale}`}
            className="inline-flex items-center rounded-xl border border-[#cfe0f8] bg-[#f8fbff] px-5 py-2.5 text-sm font-semibold text-[#194d96] transition hover:bg-white"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
