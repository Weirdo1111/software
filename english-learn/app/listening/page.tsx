import { ListeningHub } from "@/components/listening/listening-hub";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ListeningPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? { title: "听力练习", description: "提升学术听力：口音适应与真实演讲理解。" }
      : { title: "Listening", description: "Build academic listening: accent adaptation and real-world comprehension." };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <ListeningHub locale={locale} />
    </PageFrame>
  );
}
