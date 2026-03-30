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
          title: "\u5b66\u4f34\u6821\u56ed\u9996\u9875",
          description:
            "\u4f60\u7684 DIICSU Buddy Campus \u5165\u53e3\uff1a\u4ece\u684c\u5ba0\u6210\u957f\uff0c\u4eca\u65e5\u4efb\u52a1\uff0c\u542c\u529b\u4e0e\u53e3\u8bed\u573a\u666f\u5f00\u59cb\u3002",
        }
      : {
          title: "Buddy Campus Home",
          description:
            "Your DIICSU Buddy Campus entry: start from pet growth, today's quests, and your listening or speaking scenes.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <HomeActionEntry locale={locale} />
    </PageFrame>
  );
}
