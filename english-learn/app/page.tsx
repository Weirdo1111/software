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
        }
      : {
          title: "Buddy Campus Home",
        };

  return (
    <PageFrame locale={locale} title={copy.title} showHeader={false}>
      <HomeActionEntry locale={locale} />
    </PageFrame>
  );
}
