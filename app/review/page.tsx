import { PageFrame } from "@/components/page-frame";
import { ReviewPageShell } from "@/components/review/review-page-shell";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Review center"
      description="Spaced repetition keeps academic vocabulary active. Review due cards, track retention, and build long-term language memory."
    >
      <ReviewPageShell />
    </PageFrame>
  );
}
