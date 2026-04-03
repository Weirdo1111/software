import { WordGameMultiplayer } from "@/components/games/word-game-multiplayer";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function WordGameMultiplayerPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <WordGameMultiplayer locale={locale} />;
}
