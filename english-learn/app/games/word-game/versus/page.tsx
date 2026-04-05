import { WordGameVersusBattle } from "@/components/games/word-game-versus-battle";
import { getLocale } from "@/lib/i18n/get-locale";

type VersusSearchParams = {
  lang?: string;
  room?: string;
  player?: string;
};

export default async function WordGameVersusPage({ searchParams }: { searchParams: Promise<VersusSearchParams> }) {
  const locale = await getLocale(searchParams);
  const params = await searchParams;

  const room = params.room ?? "TEST01";
  const playerId = params.player ?? "";

  return <WordGameVersusBattle locale={locale} room={room} playerId={playerId} />;
}
