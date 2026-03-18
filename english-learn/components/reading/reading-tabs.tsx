"use client";

import { BookMarked, BookOpen, Clock, FileText, Layers, Search, Sparkles, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { ReadingFeedbackForm } from "@/components/forms/reading-feedback-form";
import {
  ArticleCard,
  buildReadingHref,
  cefrBadgeLabel,
  cefrStageLabel,
  difficultyStyle,
} from "@/components/reading/article-card";
import { useReadingLibrary } from "@/components/reading/use-reading-library";
import {
  articleCategories,
  getReadingArticleById,
  getReadingArticlesByIds,
  readingArticles,
} from "@/lib/reading-articles";
import { getPassageForLevel } from "@/lib/reading-passages";

type TabId = "topics" | "favorites" | "history" | "feedback";

const tabs: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "topics", label: "Topics", icon: Layers },
  { id: "favorites", label: "Favorites", icon: BookMarked },
  { id: "history", label: "History", icon: Clock },
  { id: "feedback", label: "Reading Feedback", icon: BookOpen },
];

const historyFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function ReadingTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("topics");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") ?? undefined;
  const { favoriteIds, history, hydrated, toggleFavorite } = useReadingLibrary();

  const normalizedQuery = query.trim().toLowerCase();
  const filteredArticles = readingArticles.filter((article) => {
    const matchesCategory = activeCategory === "All" || article.category === activeCategory;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const searchableText = [
      article.title,
      article.excerpt,
      article.category,
      article.focus,
      article.author,
      ...article.keywords,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  const featuredArticle =
    activeCategory === "All" && !normalizedQuery ? readingArticles.find((article) => article.featured) : undefined;

  const favoriteArticles = getReadingArticlesByIds(favoriteIds);
  const historyItems = history
    .map((entry) => {
      const article = getReadingArticleById(entry.articleId);
      if (!article) return null;

      return {
        article,
        entry,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="grid gap-5">
      <nav className="flex gap-1 overflow-x-auto rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#7b4b14] text-white shadow-sm"
                  : "text-[var(--ink-soft)] hover:bg-[rgba(20,50,75,0.05)] hover:text-[var(--ink)]"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "topics" ? (
        <TopicsPanel
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          query={query}
          onQueryChange={setQuery}
          onClearQuery={() => setQuery("")}
          filteredArticles={filteredArticles}
          featuredArticle={featuredArticle}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          lang={lang}
        />
      ) : null}

      {activeTab === "favorites" ? (
        hydrated ? (
          favoriteArticles.length > 0 ? (
            <ArticleGrid
              articles={favoriteArticles}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              lang={lang}
              contextForArticle={() => "Saved for quick return before class, revision, or feedback practice."}
            />
          ) : (
            <EmptyPanel
              icon={<BookMarked className="size-8 text-[var(--ink-soft)]" />}
              title="No saved articles yet"
              description="Bookmark useful articles while reading. Favorites are stored on this browser so you can return to them later."
            />
          )
        ) : (
          <LoadingPanel />
        )
      ) : null}

      {activeTab === "history" ? (
        hydrated ? (
          historyItems.length > 0 ? (
            <ArticleGrid
              articles={historyItems.map((item) => item.article)}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              lang={lang}
              contextForArticle={(article) => {
                const entry = historyItems.find((item) => item.article.id === article.id)?.entry;
                if (!entry) return null;

                const visitLabel = entry.viewCount === 1 ? "1 visit" : `${entry.viewCount} visits`;
                return `Last opened ${historyFormatter.format(new Date(entry.viewedAt))} | ${visitLabel}`;
              }}
            />
          ) : (
            <EmptyPanel
              icon={<Clock className="size-8 text-[var(--ink-soft)]" />}
              title="No reading history yet"
              description="Open a full article to start building your reading history. History is stored on this browser."
            />
          )
        ) : (
          <LoadingPanel />
        )
      ) : null}

      {activeTab === "feedback" ? (
        <ReadingFeedbackForm
          defaultLevel="B1"
          passage={getPassageForLevel("B1")}
          lessonId="B1-reading-starter"
          syncPassageWithTargetLevel
        />
      ) : null}
    </div>
  );
}

function TopicsPanel({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  onClearQuery,
  filteredArticles,
  featuredArticle,
  favoriteIds,
  onToggleFavorite,
  lang,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onClearQuery: () => void;
  filteredArticles: typeof readingArticles;
  featuredArticle: (typeof readingArticles)[number] | undefined;
  favoriteIds: string[];
  onToggleFavorite: (articleId: string) => void;
  lang?: string;
}) {
  const router = useRouter();
  const remainingArticles = filteredArticles.filter((article) => article.id !== featuredArticle?.id);
  const featuredHref = featuredArticle ? buildReadingHref(featuredArticle.id, lang) : null;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Search topics
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/75 px-4 py-3">
            <Search className="size-4 text-[var(--ink-soft)]" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by title, topic, keyword, or study focus"
              className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)]/80"
            />
            {query ? (
              <button
                type="button"
                onClick={onClearQuery}
                className="inline-flex size-8 items-center justify-center rounded-full bg-[rgba(20,50,75,0.06)] text-[var(--ink-soft)] transition-colors hover:bg-[rgba(20,50,75,0.12)] hover:text-[var(--ink)]"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </label>

        <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
          {filteredArticles.length} article{filteredArticles.length === 1 ? "" : "s"} matched
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {articleCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? "border-[#7b4b14] bg-[#7b4b14] text-white"
                : "border-[rgba(20,50,75,0.16)] bg-white/75 text-[var(--ink)] hover:border-[#7b4b14] hover:text-[#7b4b14]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {featuredArticle ? (
        <article
          role="link"
          tabIndex={0}
          aria-label={`Open featured article ${featuredArticle.title}`}
          onClick={() => {
            if (featuredHref) router.push(featuredHref);
          }}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && featuredHref) {
              event.preventDefault();
              router.push(featuredHref);
            }
          }}
          className="group relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-[#f7ead2] via-[#fdf5e8] to-[#f0dfc5] p-6 shadow-[0_18px_36px_rgba(23,32,51,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(23,32,51,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b4b14]/35 sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="section-label">
                <Sparkles className="size-3.5" /> Featured article
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7b4b14]/72">
                Recommended starting point in the reading library
              </p>
              <span
                className={`mt-4 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyle[featuredArticle.difficulty]}`}
              >
                {cefrBadgeLabel[featuredArticle.cefr]}
              </span>
              <p className="mt-3 text-sm font-medium text-[#7b4b14]">{cefrStageLabel[featuredArticle.cefr]}</p>
              <h3 className="font-display mt-4 text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                {featuredArticle.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">{featuredArticle.excerpt}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#35516a]">{featuredArticle.focus}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--ink-soft)]">
                <span>{featuredArticle.word_count} words</span>
                <span>{featuredArticle.author}</span>
                <span>{featuredArticle.published_at}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite(featuredArticle.id);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
              >
                <BookMarked className="size-4" />
                {favoriteIds.includes(featuredArticle.id) ? "Saved" : "Save article"}
              </button>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3]">
                Open full article
                <Sparkles className="size-4" />
              </span>
            </div>
          </div>
        </article>
      ) : null}

      {remainingArticles.length > 0 ? (
        <ArticleGrid
          articles={remainingArticles}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          lang={lang}
        />
      ) : (
        <EmptyPanel
          icon={<FileText className="size-8 text-[var(--ink-soft)]" />}
          title="No articles match this filter"
          description="Try a different keyword or switch to another topic. Search also works with skills like lecture notes, plagiarism, AI, or teamwork."
        />
      )}
    </div>
  );
}

function ArticleGrid({
  articles,
  favoriteIds,
  onToggleFavorite,
  lang,
  contextForArticle,
}: {
  articles: typeof readingArticles;
  favoriteIds: string[];
  onToggleFavorite: (articleId: string) => void;
  lang?: string;
  contextForArticle?: (article: (typeof readingArticles)[number]) => ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          href={buildReadingHref(article.id, lang)}
          isFavorite={favoriteIds.includes(article.id)}
          onToggleFavorite={onToggleFavorite}
          context={contextForArticle?.(article)}
        />
      ))}
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="surface-panel flex flex-col items-center justify-center gap-4 rounded-[2rem] px-6 py-16">
      {icon}
      <p className="text-base font-semibold text-[var(--ink)]">{title}</p>
      <p className="max-w-xl text-center text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="surface-panel rounded-[2rem] px-6 py-12 text-center text-sm leading-6 text-[var(--ink-soft)]">
      Syncing saved reading activity from this browser.
    </div>
  );
}
