import { PageFrame } from "@/components/page-frame";
import { TedLibrary } from "@/components/ted/ted-library";
import { getLocale } from "@/lib/i18n/get-locale";
import { getListeningMaterialsCatalog } from "@/lib/listening-materials-repository";

export default async function TedLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale(resolvedSearchParams);
  const materials = await getListeningMaterialsCatalog();

  return (
    <PageFrame locale={locale} title="TED Listening" description="Browse TED talks matched to your major" showHeader={false}>
      <TedLibrary materials={materials} locale={locale} />
    </PageFrame>
  );
}
