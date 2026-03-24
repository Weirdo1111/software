import { PageFrame } from "@/components/page-frame";
import { ScheduleShell } from "@/components/schedule/schedule-shell";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame locale={locale} title="Schedule" showHeader={false}>
      <ScheduleShell locale={locale} />
    </PageFrame>
  );
}
