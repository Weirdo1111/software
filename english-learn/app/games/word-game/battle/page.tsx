import { WordGameBattle } from "@/components/games/word-game-battle";

import { getLocale } from "@/lib/i18n/get-locale";

export default async function WordGameBattlePage({ searchParams }: { searchParams: Promise<{ lang?: string; bank?: string }> }) {
  const locale = await getLocale(searchParams);
  const params = await searchParams;
  const bank = params.bank ?? "general";

  return <WordGameBattle locale={locale} bank={bank} />;
}
