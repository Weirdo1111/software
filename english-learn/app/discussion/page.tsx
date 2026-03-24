import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";
import { DiscussionClient } from "@/components/discussion/discussion-client";

export default async function DiscussionPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title={locale === "zh" ? "讨论区" : "Discussion"}
      showHeader={false}
    >
      <DiscussionClient locale={locale} />
    </PageFrame>
  );
}