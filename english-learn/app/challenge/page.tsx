import { ChallengeHub } from "@/components/challenge/challenge-hub";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? {
          title: "Challenge",
          description: "Open the listening or speaking test route from one place.",
        }
      : {
          title: "Challenge",
          description: "Open the listening or speaking test route from one place.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <ChallengeHub locale={locale} />
    </PageFrame>
  );
}
