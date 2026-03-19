import { PageFrame } from "@/components/page-frame";
import { ReadingTabs } from "@/components/reading/reading-tabs";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Academic Reading"
      description="Search article topics, open full readings, save favorites, track history, and practise structured comprehension with AI feedback."
    >
      <ReadingTabs />
    </PageFrame>
  );
}
