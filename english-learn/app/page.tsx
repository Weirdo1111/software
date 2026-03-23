import { HomeActionEntry } from "@/components/home/home-action-entry";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "首页 Home",
          description: "你的每日学习入口：先看下一步，再进入模块，最后在 Dashboard 查看完整进度。",
        }
      : {
          title: "Home",
          description: "Your daily learning entry: pick the next action first, jump into modules quickly, then review full progress in Dashboard.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <HomeActionEntry locale={locale} />
    </PageFrame>
  );
}
