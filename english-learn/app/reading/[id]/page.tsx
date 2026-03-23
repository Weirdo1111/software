import { notFound } from "next/navigation";

import { PageFrame } from "@/components/page-frame";
import { ReadingArticleShell } from "@/components/reading/reading-article-shell";
import { getLocale } from "@/lib/i18n/get-locale";
import { getReadingArticleById, readingArticles } from "@/lib/reading-articles";

export function generateStaticParams() {
  return readingArticles.map((article) => ({ id: article.id }));
}

export default async function ReadingArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const locale = await getLocale(searchParams);
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const rawLang = resolvedSearchParams?.lang;
  const lang = Array.isArray(rawLang) ? rawLang[0] : rawLang;

  const article = getReadingArticleById(resolvedParams.id);

  if (!article) {
    notFound();
  }

  return (
    <PageFrame locale={locale} title={article.title} description={article.focus} showHeader={false}>
      <ReadingArticleShell article={article} lang={lang} />
    </PageFrame>
  );
}
