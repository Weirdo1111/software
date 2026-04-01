import { redirect } from "next/navigation";

import { getLocale } from "@/lib/i18n/get-locale";

export default async function TedDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ lang?: string; level?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale(resolvedSearchParams);
  const level = resolvedSearchParams.level;
  const levelParam = typeof level === "string" && level.length > 0 ? `&level=${encodeURIComponent(level)}` : "";

  redirect(`/listening/${resolvedParams.groupId}?lang=${locale}${levelParam}`);
}
