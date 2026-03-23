import { MessageSquareText } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";
import { DiscussionBoard } from "@/components/discussion/discussion-board";

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
      description={
        locale === "zh"
          ? "围绕学习任务、分级测评、四项能力练习与反馈展开交流。"
          : "A focused discussion space for assessment, four-skill learning, feedback, and study strategy."
      }
    >
      <section className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
        <p className="section-label">
          <MessageSquareText className="size-3.5" />{" "}
          {locale === "zh" ? "学习社区" : "Community"}
        </p>

        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          {locale === "zh"
            ? "提出问题，分享经验，围绕学习路径进行讨论。"
            : "Ask questions, share strategies, and discuss your learning path."}
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
          {locale === "zh"
            ? "当前版本先使用本地数据与浏览器存储模拟帖子、点赞与评论。后续可直接接入数据库。"
            : "This version uses local state and browser storage for posts, likes, and comments. You can later replace the storage layer with a database."}
        </p>
      </section>

      <div className="mt-6">
        <DiscussionBoard locale={locale} />
      </div>
    </PageFrame>
  );
}