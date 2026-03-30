import { LastTrainEscapeGame } from "@/components/last-train-escape/LastTrainEscapeGame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function LastTrainEscapeGamePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <LastTrainEscapeGame locale={locale} />;
}
