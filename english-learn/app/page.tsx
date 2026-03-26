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
          title: "\u9996\u9875",
          description:
            "\u4f60\u7684\u6bcf\u65e5\u5b66\u4e60\u5165\u53e3\uff1a\u5148\u770b\u4e0b\u4e00\u6b65\uff0c\u518d\u8fdb\u5165\u6a21\u5757\uff0c\u6700\u540e\u5728 Dashboard \u67e5\u770b\u5b8c\u6574\u8fdb\u5ea6\u3002",
        }
      : {
          title: "Home",
          description:
            "Your daily learning entry: pick the next action first, jump into modules quickly, then review full progress in Dashboard.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <HomeActionEntry locale={locale} />
    </PageFrame>
  );
}
