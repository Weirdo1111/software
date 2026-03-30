import { DiscussionClient } from "@/components/discussion/discussion-client";
import { PageFrame } from "@/components/page-frame";

export default async function DiscussionPage({
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = "en";

  return (
    <PageFrame
      locale={locale}
      title="Discussion"
      showHeader={false}
    >
      <DiscussionClient locale={locale} />
    </PageFrame>
  );
}
