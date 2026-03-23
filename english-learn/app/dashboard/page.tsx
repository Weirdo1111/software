import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "Dashboard",
          description: "学习状态、技能进度、系统建议与最近活动总览。",
        }
      : {
          title: "Dashboard",
          description: "A structured view of status, four-skill progress, recommendation, and recent activity.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <DashboardOverview locale={locale} />
    </PageFrame>
  );
}
