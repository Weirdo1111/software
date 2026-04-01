import { redirect } from "next/navigation";

import { getLocale } from "@/lib/i18n/get-locale";

export default async function TedLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale(resolvedSearchParams);

  redirect(`/listening?lang=${locale}`);
}
