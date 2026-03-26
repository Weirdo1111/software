import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "\u603b\u89c8",
          description:
            "\u67e5\u770b\u5f53\u524d\u5b66\u4e60\u72b6\u6001\uff0c\u542c\u8bf4\u8bfb\u5199\u8fdb\u5ea6\uff0c\u7cfb\u7edf\u5efa\u8bae\u4e0e\u6700\u8fd1\u6d3b\u52a8\u3002",
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
