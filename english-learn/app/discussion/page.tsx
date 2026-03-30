import { DiscussionClient } from "@/components/discussion/discussion-client";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function DiscussionPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title={locale === "zh" ? "\u8ba8\u8bba\u533a" : "Discussion"}
      showHeader={false}
    >
      <DiscussionClient locale={locale} />
    </PageFrame>
  );
}
