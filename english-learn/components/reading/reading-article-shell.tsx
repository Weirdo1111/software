"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, BookmarkCheck, Clock3, FileText, Sparkles } from "lucide-react";
import { useEffect } from "react";

import {
  ArticleCard,
  buildReadingHref,
  cefrBadgeLabel,
  cefrStageLabel,
  difficultyStyle,
  examReferenceLabel,
} from "@/components/reading/article-card";
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

const historyFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function ReadingArticleShell({
  article,
  lang,
}: {
  article: ReadingArticle;
  lang?: string;
}) {
  const { favoriteIds, history, hydrated, toggleFavorite, pushHistory } = useReadingLibrary();

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
            <p className="section-label">
              <BookOpen className="size-3.5" /> Full article
            </p>
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
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

        <aside className="grid gap-4">
          <article className="surface-panel rounded-[1.7rem] p-5">
            <p className="section-label">
              <Clock3 className="size-3.5" /> Reading activity
            </p>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--ink-soft)]">
              <p>
                {historyEntry
                  ? `Last opened ${historyFormatter.format(new Date(historyEntry.viewedAt))}`
                  : "This article will appear in your history after this page finishes loading."}
              </p>
              <p>{historyEntry ? `${historyEntry.viewCount} recorded visit(s) on this browser.` : "No previous visits yet."}</p>
              <p>Favorites and history are stored locally so this feature still works without database setup.</p>
            </div>
          </article>

          <article className="surface-panel rounded-[1.7rem] p-5">
            <p className="section-label">
              <Sparkles className="size-3.5" /> Why this article matters
            </p>
            <div className="mt-4 grid gap-3">
              {article.takeaways.map((takeaway) => (
                <div key={takeaway} className="rounded-[1rem] bg-[rgba(123,75,20,0.06)] px-4 py-3 text-sm leading-6 text-[var(--ink)]">
                  {takeaway}
                </div>
              ))}
            </div>
          </article>

          <article className="surface-panel rounded-[1.7rem] p-5">
            <p className="section-label">
              <FileText className="size-3.5" /> Keywords
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {article.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-3 py-2 text-sm text-[var(--ink)]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </article>

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
        </aside>
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
