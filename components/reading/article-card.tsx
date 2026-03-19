"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, Bookmark, BookmarkCheck, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import type { ReadingArticle } from "@/lib/reading-articles";
import { cn } from "@/lib/utils";

export const difficultyStyle: Record<ReadingArticle["difficulty"], string> = {
  Low: "border-[#7ca7c8]/60 bg-[#edf5fb] text-[#14324b]",
  Medium: "border-[#6a9483]/60 bg-[#edf6f1] text-[#1a493f]",
  High: "border-[#d88e34]/60 bg-[#fff4e4] text-[#7b4b14]",
};

export const cefrBadgeLabel: Record<ReadingArticle["cefr"], string> = {
  A2: "CEFR A2",
  B1: "CEFR B1",
  B2: "CEFR B2",
};

export const cefrStageLabel: Record<ReadingArticle["cefr"], string> = {
  A2: "Foundation Builder",
  B1: "Academic Bridge",
  B2: "Advanced Analysis",
};

export const examReferenceLabel: Record<ReadingArticle["cefr"], string> = {
  A2: "Reference only: below or approaching CET-4 style reading.",
  B1: "Reference only: around CET-4 to early IELTS-style academic reading.",
  B2: "Reference only: around CET-6 to stronger IELTS-style academic reading.",
};

export function buildReadingHref(articleId: string, lang?: string) {
  return lang ? `/reading/${articleId}?lang=${lang}` : `/reading/${articleId}`;
}

export function ArticleCard({
  article,
  href,
  isFavorite,
  onToggleFavorite,
  context,
  className,
}: {
  article: ReadingArticle;
  href: string;
  isFavorite: boolean;
  onToggleFavorite: (articleId: string) => void;
  context?: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${article.title}`}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      }}
      className={cn(
        "surface-panel group relative grid cursor-pointer gap-3 rounded-[1.6rem] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(23,32,51,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b4b14]/35",
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyle[article.difficulty]}`}
          >
            {cefrBadgeLabel[article.cefr]}
          </span>
          <span className="text-xs font-medium text-[#7b4b14]">{cefrStageLabel[article.cefr]}</span>
          <span className="text-xs text-[var(--ink-soft)]">{article.category}</span>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(article.id);
          }}
          className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(20,50,75,0.12)] bg-white/80 text-[var(--ink-soft)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          {isFavorite ? <BookmarkCheck className="size-4 text-[#7b4b14]" /> : <Bookmark className="size-4" />}
        </button>
      </div>

      <div className="relative z-10 grid gap-3">
        <h3 className="text-base font-semibold leading-6 text-[var(--ink)] transition-colors group-hover:text-[#7b4b14]">
          {article.title}
        </h3>
        <p className="text-sm leading-6 text-[var(--ink-soft)] line-clamp-3">{article.excerpt}</p>
        <p className="text-sm leading-6 text-[#35516a]">{article.focus}</p>
        {context ? <div className="rounded-[1rem] bg-[rgba(123,75,20,0.06)] px-3 py-2 text-sm text-[#7b4b14]">{context}</div> : null}
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--ink-soft)]">
        <div className="flex flex-wrap gap-4">
          <span>{article.word_count} words</span>
          <span>
            <MessageCircle className="mr-1 inline size-3" />
            {article.read_count}
          </span>
          <span>{article.published_at}</span>
        </div>
        <span className="inline-flex items-center gap-1 font-medium text-[#7b4b14]">
          Read article
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </article>
  );
}
