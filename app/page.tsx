import { HomeFeatureMap } from "@/components/home/home-feature-map";
import { HomeHero } from "@/components/home/home-hero";
import { HomeJourneyBands } from "@/components/home/home-journey-bands";
import { HomeLearningModules } from "@/components/home/home-learning-modules";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionaries";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame locale={locale} title={t(locale, "hero_title")} description={t(locale, "hero_desc")}>
      <HomeHero locale={locale} />
      <HomeLearningModules />
      <HomeJourneyBands />
      <HomeFeatureMap />
    </PageFrame>
  );
}
