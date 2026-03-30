import { DiscussionClient } from "@/components/discussion/discussion-client";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function DiscussionPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string; view?: string; search?: string }>;
}) {
  const locale = await getLocale(searchParams);
  const params = await searchParams;

  return (
    <PageFrame
      locale={locale}
      title={locale === "zh" ? "讨论区" : "Discussion"}
      showHeader={false}
    >
      <DiscussionClient
        locale={locale}
        initialCategory={params.category}
        initialView={params.view}
        initialSearch={params.search}
      />
    </PageFrame>
  );
}
