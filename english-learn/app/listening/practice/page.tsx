import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ListeningPractice } from "@/components/listening/listening-practice";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ListeningPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await getLocale(searchParams);

  const copy =
    locale === "zh"
      ? { title: "听力训练", back: "返回选择", description: "选择专业话题，边听边看原文、调整语速、做笔记。" }
      : { title: "Listening Practice", back: "Back to Listening", description: "Pick a topic, listen at your own pace with transcript and speed control." };

  return (
    <PageFrame locale={locale} title={copy.title} description={copy.description} showHeader={false}>
      <div className="mb-4">
        <Link
          href={`/listening?lang=${locale}`}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:bg-[rgba(20,50,75,0.04)]"
        >
          <ArrowLeft className="size-4" />
          {copy.back}
        </Link>
      </div>
      <ListeningPractice locale={locale} />
    </PageFrame>
  );
}
