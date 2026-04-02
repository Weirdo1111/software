import { ListeningTestModule } from "@/components/listening/listening-test-module";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";
import { getListeningMaterialsCatalog } from "@/lib/listening-materials-repository";

export default async function ListeningTestPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);
  const materials = await getListeningMaterialsCatalog();

  const copy =
    locale === "zh"
      ? {
          title: "听力测试",
          description: "每次测试随机抽取 2 条 TED 听力材料，回答问题后即时评分。",
        }
      : {
          title: "Listening Test",
          description:
            "Each session randomly selects 2 TED listening materials and scores answers immediately.",
        };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <ListeningTestModule locale={locale} materials={materials} />
    </PageFrame>
  );
}
