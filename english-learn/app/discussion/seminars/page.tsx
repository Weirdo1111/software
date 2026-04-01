import { SeminarRoomsClient } from "@/components/discussion/seminars/seminar-rooms-client";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function SeminarRoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title={locale === "zh" ? "Forum · 在线研讨室" : "Forum · Seminar Rooms"}
      description={
        locale === "zh"
          ? "在现有论坛之上补一层更适合专题讨论、资料交换和近实时聊天的在线研讨空间。"
          : "A seminar-style layer on top of the existing forum for focused discussion, media sharing, and near real-time chat."
      }
      showHeader={false}
    >
      <SeminarRoomsClient locale={locale} />
    </PageFrame>
  );
}
