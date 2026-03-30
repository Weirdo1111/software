import DiscussionActivityClient from "@/components/discussion/discussion-activity-client";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return <DiscussionActivityClient locale={locale} />;
}
