import { LearnHero } from "@/components/learn/learn-hero";
import { LearnModuleGrid } from "@/components/learn/learn-module-grid";
import { LearnStudyLoop } from "@/components/learn/learn-study-loop";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = await getLocale(searchParams);

  return (
    <PageFrame
      locale={locale}
      title="Learning modules for academic English"
      description="The launch UI centers on four connected modules with level-sensitive difficulty, visible outputs, and a clear loop from study to progress tracking."
    >
      <LearnHero locale={locale} />
      <LearnModuleGrid locale={locale} />
      <LearnStudyLoop />
    </PageFrame>
  );
}
