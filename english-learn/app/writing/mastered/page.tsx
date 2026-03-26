import { MasteredLanguagePageShell } from "@/components/forms/mastered-language-page-shell";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function MasteredWritingLanguagePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Mastered writing language"
      description="Review the vocabulary and sentence models you have already moved into your mastered writing bank."
      showHeader={false}
    >
      <MasteredLanguagePageShell />
    </PageFrame>
  );
}
