import { GameSelectorModal } from "@/components/games/game-selector-modal";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <GameSelectorModal locale={locale} />;
}
