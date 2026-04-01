import { WordGameRecovery } from "@/components/games/word-game-recovery";
import type { RecoveryWord } from "@/lib/games/word-game-recovery";
import { getLocale } from "@/lib/i18n/get-locale";

function parseQueue(raw?: string): RecoveryWord[] {
  if (!raw) return [];

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is RecoveryWord =>
        item &&
        typeof item.word === "string" &&
        typeof item.meaningEn === "string" &&
        typeof item.meaningZh === "string" &&
        typeof item.uk === "string" &&
        typeof item.us === "string" &&
        Array.isArray(item.examples),
    );
  } catch {
    return [];
  }
}

export default async function WordGameRecoveryPage({ searchParams }: { searchParams: Promise<{ lang?: string; bank?: string; source?: string; queue?: string }> }) {
  const locale = await getLocale(searchParams);
  const params = await searchParams;
  const bank = params.bank ?? "general";
  const source = params.source === "victory" ? "victory" : "critical";
  const initialQueue = parseQueue(params.queue);

  return <WordGameRecovery locale={locale} bank={bank} initialQueue={initialQueue} source={source} />;
}
