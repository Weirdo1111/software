import { notFound } from "next/navigation";

import { PageFrame } from "@/components/page-frame";
import { TedDetail } from "@/components/ted/ted-detail";
import { getLocale } from "@/lib/i18n/get-locale";
import { getListeningMaterialsCatalog } from "@/lib/listening-materials-repository";
import type { CEFRLevel } from "@/types/learning";

export default async function ListeningMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ lang?: string; level?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale(resolvedSearchParams);
  const catalog = await getListeningMaterialsCatalog();

  const material = catalog.find((item) => item.materialGroupId === resolvedParams.groupId);

  if (!material) {
    notFound();
  }

  const level = (resolvedSearchParams.level ?? material.recommendedLevel ?? "B1") as CEFRLevel;

  return (
    <PageFrame
      locale={locale}
      title={material.title}
      description={material.scenario}
      showHeader={false}
    >
      <TedDetail material={material} defaultLevel={level} locale={locale} />
    </PageFrame>
  );
}
