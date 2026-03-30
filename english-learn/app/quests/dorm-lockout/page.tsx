import { DormLockoutGame } from "@/components/dorm-lockout/DormLockoutGame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function DormLockoutQuestPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return <DormLockoutGame locale={locale} />;
}
