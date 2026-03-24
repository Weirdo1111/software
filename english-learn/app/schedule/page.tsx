import { PageFrame } from "@/components/page-frame";
import { ScheduleShell } from "@/components/schedule/schedule-shell";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);
  const title = locale === "zh" ? "\u5b66\u4e60\u8ba1\u5212" : "Schedule";

  return (
    <PageFrame locale={locale} title={title} showHeader={false}>
      <ScheduleShell locale={locale} />
    </PageFrame>
  );
}
