import { redirect } from "next/navigation";

import { DiscussionManagerReviewClient } from "@/components/discussion/discussion-manager-review-client";
import { PageFrame } from "@/components/page-frame";
import { getCurrentAuthIdentity, isManagerIdentity } from "@/lib/current-user";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);
  const identity = await getCurrentAuthIdentity();

  if (!identity) {
    redirect(`/login?lang=${locale}`);
  }

  if (!isManagerIdentity(identity)) {
    redirect(`/dashboard?lang=${locale}`);
  }

  const copy =
    locale === "zh"
      ? {
          title: "帖子审核",
          description: "只查看普通用户提交后等待审核的论坛帖子，并执行同意或拒绝发布。",
        }
      : {
          title: "Post Moderation",
          description: "Review pending forum posts from learners and approve or reject publication.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <DiscussionManagerReviewClient locale={locale} />
    </PageFrame>
  );
}
