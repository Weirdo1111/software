import { WordGameLanding } from "@/components/games/word-game-landing";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function WordGamePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <WordGameLanding locale={locale} />;
}
