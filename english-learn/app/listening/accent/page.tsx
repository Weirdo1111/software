import { AccentPractice } from "@/components/listening/accent-practice";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function AccentPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? { title: "听力训练", description: "选择专业话题，边听边看原文、调整语速、做笔记。" }
      : { title: "Listening Practice", description: "Pick a topic, listen at your own pace with transcript and speed control." };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <AccentPractice locale={locale} />
    </PageFrame>
  );
}
