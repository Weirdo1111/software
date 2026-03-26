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
      ? { title: "听力资源库", description: "按专业、来源与口音浏览 TED、公开讲座、学术访谈和播客。" }
      : { title: "Listening Library", description: "Browse TED talks, lectures, interviews, and podcasts by major, source, and accent." };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <TedLibrary materials={materials} locale={locale} />
    </PageFrame>
  );
}
