import { PageFrame } from "@/components/page-frame";
import { TedLibrary } from "@/components/ted/ted-library";
import { getLocale } from "@/lib/i18n/get-locale";
import { getListeningMaterialsCatalog } from "@/lib/listening-materials-repository";

export default async function ListeningPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);
  const materials = await getListeningMaterialsCatalog();

  const copy =
    locale === "zh"
      ? { title: "TED 听力资源库", description: "按专业、口音与地区浏览 TED 听力材料，并在站内完成做题训练。" }
      : { title: "TED Listening Library", description: "Browse TED listening materials by major, accent, and region, and complete in-app questions." };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <TedLibrary materials={materials} locale={locale} />
    </PageFrame>
  );
}
