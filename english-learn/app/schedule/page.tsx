import { PageFrame } from "@/components/page-frame";
import { ScheduleShell } from "@/components/schedule/schedule-shell";
import { getLocale } from "@/lib/i18n/get-locale";

function normalizeFocusDate(value: string | undefined) {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale(params);
  const title = locale === "zh" ? "\u4efb\u52a1\u5730\u56fe" : "Quest Map";
  const initialFocusDateISO = normalizeFocusDate(params.focus);

  return (
    <PageFrame locale={locale} title={title} showHeader={false}>
      <ScheduleShell locale={locale} initialFocusDateISO={initialFocusDateISO} />
    </PageFrame>
  );
}
