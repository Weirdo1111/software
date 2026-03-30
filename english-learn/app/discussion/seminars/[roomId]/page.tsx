import { SeminarRoomClient } from "@/components/discussion/seminars/seminar-room-client";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function SeminarRoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { roomId } = await params;
  const locale = await getLocale(searchParams);

  return (
    <PageFrame locale={locale} title={locale === "zh" ? "在线研讨室" : "Seminar Room"}>
      <SeminarRoomClient locale={locale} roomId={roomId} />
    </PageFrame>
  );
}
