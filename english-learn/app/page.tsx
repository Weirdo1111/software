import { HomeActionEntry } from "@/components/home/home-action-entry";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);
  const title = locale === "zh" ? "\u9093\u8fea\u56fd\u9645\u5b66\u9662\u5b66\u672f\u82f1\u8bed\u5e73\u53f0" : "DIICSU Academic English Hub";

  return (
    <PageFrame locale={locale} title={title} showHeader={false} showShell={false}>
      <HomeActionEntry locale={locale} />
    </PageFrame>
  );
}
