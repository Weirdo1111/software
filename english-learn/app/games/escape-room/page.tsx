import { GameCenterHub } from "@/components/escape-room/GameCenterHub";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function EscapeRoomGamePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <GameCenterHub locale={locale} />;
}
