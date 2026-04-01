import { WordGameSelect } from "@/components/games/word-game-select";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function WordGameSelectPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <WordGameSelect locale={locale} />;
}
