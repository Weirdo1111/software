import { redirect } from "next/navigation";

export default async function ForumSeminarRoomAliasPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { roomId } = await params;
  const query = await searchParams;

  redirect(`/discussion/seminars/${roomId}${query.lang ? `?lang=${query.lang}` : ""}`);
}
