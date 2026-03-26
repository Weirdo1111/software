"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect } from "react";

import {
  ArticleCard,
  buildReadingHref,
  cefrBadgeLabel,
  cefrStageLabel,
  difficultyStyle,
  examReferenceLabel,
} from "@/components/reading/article-card";
import { ContextDock } from "@/components/context-comments/context-dock";
import { ParagraphNote } from "@/components/reading/paragraph-note";
import { useReadingLibrary } from "@/components/reading/use-reading-library";
import { WordLookupLayer } from "@/components/reading/word-lookup-layer";
import { getLessonCodeForReadingArticle, getRelatedArticles, type ReadingArticle } from "@/lib/reading-articles";

function buildLessonHref(article: ReadingArticle, lang?: string) {
  const lessonCode = getLessonCodeForReadingArticle(article);
  const params = new URLSearchParams({ articleId: article.id });
  if (lang) params.set("lang", lang);
  return `/lesson/${lessonCode}?${params.toString()}`;
}

function buildLibraryHref(lang?: string) {
  return lang ? `/reading?lang=${lang}` : "/reading";
}

export function ReadingArticleShell({
  article,
  lang,
}: {
  article: ReadingArticle;
  lang?: string;
}) {
  const { favoriteIds, history, hydrated, toggleFavorite, pushHistory } = useReadingLibrary();
  const locale = lang === "zh" ? "zh" : "en";
  const discussionContext = {
    module: "reading" as const,
    targetId: `article:${article.id}`,
    title: article.title,
    subtitle: article.category,
    plazaTag: locale === "zh" ? "阅读" : "Reading",
    topics:
      locale === "zh"
        ? ["观点", "段落", "证据", "词汇"]
        : ["Argument", "Paragraph", "Evidence", "Vocabulary"],
    starters:
      locale === "zh"
        ? [
            "我最想讨论的段落是",
            "这篇文章最有力的证据是",
            "这个表达在学术写作里可以怎么复用",
          ]
        : [
            "The paragraph I want to discuss is",
            "The strongest evidence in this article is",
            "A phrase I could reuse in academic writing is",
          ],
    seedComments:
      locale === "zh"
        ? [
            {
              author: "Tutor note",
              topic: "段落",
              content: "读长段落时，先判断它是在给观点、例子还是解释。",
              createdAt: "2026-03-24T08:30:00.000Z",
              likes: 4,
            },
            {
              author: "Aiden",
              topic: "词汇",
              content: "我会先记 section 标题里的关键词，再读正文，速度会快一些。",
              createdAt: "2026-03-24T09:55:00.000Z",
              likes: 2,
            },
          ]
        : [
            {
              author: "Tutor note",
              topic: "Paragraph",
              content:
                "When a paragraph feels dense, decide whether it is giving a claim, an example, or an explanation first.",
              createdAt: "2026-03-24T08:30:00.000Z",
              likes: 4,
            },
            {
              author: "Aiden",
              topic: "Vocabulary",
              content:
                "I save the keywords from the section headings first, then the body is easier to follow.",
              createdAt: "2026-03-24T09:55:00.000Z",
              likes: 2,
            },
          ],
  };

  useEffect(() => {
    if (!hydrated) return;
    pushHistory(article.id);
  }, [article.id, hydrated, pushHistory]);

  const isFavorite = favoriteIds.includes(article.id);
  const historyEntry = history.find((entry) => entry.articleId === article.id);
  const relatedArticles = getRelatedArticles(article, 3);

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br from-[#f7ead2] via-white to-[#fdf5e8] p-6 shadow-[0_20px_45px_rgba(23,32,51,0.08)] sm:p-7">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
          <Link
            href={buildLibraryHref(lang)}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-white/75 px-4 py-2 font-medium text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
          >
            <ArrowLeft className="size-4" />
            Back to reading library
          </Link>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyle[article.difficulty]}`}>
            {cefrBadgeLabel[article.cefr]}
          </span>
          <span className="text-sm font-medium text-[#7b4b14]">{cefrStageLabel[article.cefr]}</span>
          <span>{article.category}</span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-start gap-3">
              <p className="section-label">
                <BookOpen className="size-3.5" /> Full article
              </p>
              <div className="rounded-[1rem] border border-[#7b4b14]/18 bg-[rgba(123,75,20,0.1)] px-3 py-2 text-sm text-[#7b4b14]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b4b14]/78">
                  Reading history
                </p>
                <p className="mt-1 font-medium">
                  {historyEntry
                    ? `${historyEntry.viewCount} visit${historyEntry.viewCount === 1 ? "" : "s"}`
                    : "1 visit"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-[var(--ink-soft)]">{examReferenceLabel[article.cefr]}</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">{article.title}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)] sm:text-base">{article.focus}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-[var(--ink-soft)]">
              <span>{article.author}</span>
              <span>{article.word_count} words</span>
              <span>{article.published_at}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(article.id)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
          >
            {isFavorite ? <BookmarkCheck className="size-4 text-[#7b4b14]" /> : <Bookmark className="size-4" />}
            {isFavorite ? "Saved to favorites" : "Save this article"}
          </button>
        </div>
      </section>

      <section className="grid gap-6">
        <WordLookupLayer>
          <article className="surface-panel rounded-[2rem] p-6 sm:p-7">
            <div className="grid gap-8">
              {article.sections.map((section, sectionIndex) => (
                <section key={section.heading} className="grid gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Section</p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">{section.heading}</h3>
                  </div>
                  <div className="grid gap-4">
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <div key={paragraph} className="group/para flex items-start gap-2">
                        <p className="flex-1 text-sm leading-8 text-[var(--ink)] sm:text-[15px]">
                          {paragraph}
                        </p>
                        <div className="mt-1 flex-shrink-0">
                          <ParagraphNote
                            articleId={article.id}
                            paragraphKey={`${sectionIndex}-${paragraphIndex}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </WordLookupLayer>

        <article className="overflow-hidden rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-[var(--navy)] p-5 text-[#f7efe3] shadow-[0_18px_36px_rgba(23,32,51,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f2d9ae]">Bridge to practice</p>
          <h3 className="font-display mt-4 text-2xl tracking-tight">Move from article reading to guided feedback.</h3>
          <p className="mt-3 text-sm leading-7 text-[#efe5d6]/80">{article.reflection_prompt}</p>
          <Link
            href={buildLessonHref(article, lang)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f7efe3] px-5 py-3 text-sm font-semibold text-[var(--navy)]"
          >
            Practice this article
            <ArrowRight className="size-4" />
          </Link>
        </article>

        <ContextDock
          key={`reading:${discussionContext.targetId}`}
          locale={locale}
          context={discussionContext}
        />
      </section>

      {/* Related articles */}
      {relatedArticles.length > 0 ? (
        <section className="surface-panel rounded-[2rem] p-6 sm:p-7">
          <p className="section-label">
            <ArrowUpRight className="size-3.5" /> Related articles
          </p>
          <h2 className="font-display mt-4 text-2xl tracking-tight text-[var(--ink)]">
            Continue reading on similar topics.
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedArticles.map((related) => (
              <ArticleCard
                key={related.id}
                article={related}
                href={buildReadingHref(related.id, lang)}
                isFavorite={favoriteIds.includes(related.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
