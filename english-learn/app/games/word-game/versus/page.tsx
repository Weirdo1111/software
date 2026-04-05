import { WordGameVersusBattle } from "@/components/games/word-game-versus-battle";
import { getLocale } from "@/lib/i18n/get-locale";

type VersusSearchParams = {
  lang?: string;
  bank?: string;
  room?: string;
};

export default async function WordGameVersusPage({ searchParams }: { searchParams: Promise<VersusSearchParams> }) {
  const locale = await getLocale(searchParams);
  const params = await searchParams;

  const bank = params.bank ?? "general";
  const room = params.room ?? "TEST01";

  return <WordGameVersusBattle locale={locale} bank={bank} room={room} />;
}
