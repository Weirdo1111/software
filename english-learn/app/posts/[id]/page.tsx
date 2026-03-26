import DiscussionDetailClient from "@/components/discussion/discussion-detail-client";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiscussionDetailClient locale="en" postId={id} />;
}