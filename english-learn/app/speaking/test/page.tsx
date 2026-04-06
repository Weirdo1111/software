import { PageFrame } from "@/components/page-frame";
import { SpeakingTestModule } from "@/components/speaking/speaking-test-module";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function SpeakingTestPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "Speaking Test",
          description:
            "Draw 1 of 5 oral test sets, answer 3 guided questions with AI questioning, and receive a 100-point evaluation.",
        }
      : {
          title: "Speaking Test",
          description:
            "Draw 1 of 5 oral test sets, answer 3 guided questions with AI questioning, and receive a 100-point evaluation.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <SpeakingTestModule locale={locale} />
    </PageFrame>
  );
}
