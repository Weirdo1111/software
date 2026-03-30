import { DiscussionRoleplayPanel } from "@/components/discussion/discussion-roleplay-panel";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function DiscussionRoleplayPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame locale={locale} title="Roleplay Chat" showHeader={false}>
      <DiscussionRoleplayPanel locale={locale} />
    </PageFrame>
  );
}
