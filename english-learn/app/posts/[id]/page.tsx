import DiscussionDetailClient from "@/components/discussion/discussion-detail-client";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale(searchParams);
  return <DiscussionDetailClient locale={locale} postId={id} />;
}
