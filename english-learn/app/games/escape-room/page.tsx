import { EscapeRoomGame } from "@/components/escape-room/EscapeRoomGame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function EscapeRoomGamePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <EscapeRoomGame locale={locale} />;
}
