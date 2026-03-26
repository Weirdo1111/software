import { redirect } from "next/navigation";

import { getLocale } from "@/lib/i18n/get-locale";

export default async function ListeningPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  redirect(`/listening/ted?lang=${locale}`);
}
