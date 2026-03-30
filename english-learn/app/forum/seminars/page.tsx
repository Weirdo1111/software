import { redirect } from "next/navigation";

export default async function ForumSeminarsAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  redirect(`/discussion/seminars${params.lang ? `?lang=${params.lang}` : ""}`);
}
