"use client";

import { useMemo, useState } from "react";
import {
  Heart,
  MessageCircle,
  Pin,
  Clock3,
  TrendingUp,
  LayoutList,
  Search,
  Plus,
} from "lucide-react";
import type { DiscussionPost } from "@/app/discussion/page";

type Locale = "zh" | "en";
type ViewMode = "all" | "hot" | "latest";

interface DiscussionBoardProps {
  locale: Locale;
  posts: DiscussionPost[];
  onLike: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onOpenComposer: () => void;
}

export function DiscussionBoard({
  locale,
  posts,
  onLike,
  onAddComment,
  onOpenComposer,
}: DiscussionBoardProps) {
  const [view, setView] = useState<ViewMode>("all");
  const [search, setSearch] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const text = {
    zh: {
      all: "全部",
      latest: "最新",
      hot: "热门",
      searchPlaceholder: "搜索帖子标题或内容...",
      comments: "评论",
      addComment: "发表评论",
      commentPlaceholder: "写下你的想法...",
      empty: "当前还没有帖子，试着发布第一条讨论。",
      noResult: "没有匹配的帖子。",
      pinned: "置顶",
      noComments: "还没有评论，来发表第一条回复吧。",
      threads: "篇帖子",
    },
    en: {
      all: "All",
      latest: "Latest",
      hot: "Hot",
      searchPlaceholder: "Search threads...",
      comments: "Comments",
      addComment: "Add comment",
      commentPlaceholder: "Write your reply...",
      empty: "No discussions yet. Create the first one.",
      noResult: "No matching threads.",
      pinned: "Pinned",
      noComments: "No comments yet. Start the conversation.",
      threads: "threads",
    },
  }[locale];

  const filteredAndSortedPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let arr = [...posts];

    if (keyword) {
      arr = arr.filter((post) => {
        const haystack = [
          post.title,
          post.content,
          post.author,
          post.tag,
          ...post.comments.map((c) => c.content),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      });
    }

    if (view === "hot") {
      arr.sort((a, b) => b.likes - a.likes);
      return arr;
    }

    if (view === "latest") {
      arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return arr;
    }

    arr.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return arr;
  }, [posts, search, view]);

  const handleSubmitComment = (postId: string) => {
    const draft = (commentDrafts[postId] || "").trim();
    if (!draft) return;

    onAddComment(postId, draft);
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  const showEmpty = posts.length === 0;
  const showNoResult = posts.length > 0 && filteredAndSortedPosts.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.88)] p-2 shadow-[0_14px_36px_rgba(23,32,51,0.06)] backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-[1.1rem] bg-white/75 p-1">
              <button
                type="button"
                onClick={() => setView("all")}
                className={`inline-flex items-center gap-2 rounded-[0.95rem] px-3 py-2 text-sm font-medium transition ${
                  view === "all"
                    ? "bg-white text-[var(--ink)] shadow-sm"
                    : "text-[var(--ink-soft)] hover:bg-[var(--navy)] hover:text-[#f7efe3]"
                }`}
              >
                <LayoutList className="size-4" />
                {text.all}
              </button>

              <button
                type="button"
                onClick={() => setView("hot")}
                className={`inline-flex items-center gap-2 rounded-[0.95rem] px-3 py-2 text-sm font-medium transition ${
                  view === "hot"
                    ? "bg-white text-[var(--ink)] shadow-sm"
                    : "text-[var(--ink-soft)] hover:bg-[var(--navy)] hover:text-[#f7efe3]"
                }`}
              >
                <TrendingUp className="size-4" />
                {text.hot}
              </button>

              <button
                type="button"
                onClick={() => setView("latest")}
                className={`inline-flex items-center gap-2 rounded-[0.95rem] px-3 py-2 text-sm font-medium transition ${
                  view === "latest"
                    ? "bg-white text-[var(--ink)] shadow-sm"
                    : "text-[var(--ink-soft)] hover:bg-[var(--navy)] hover:text-[#f7efe3]"
                }`}
              >
                <Clock3 className="size-4" />
                {text.latest}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenComposer}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-[var(--navy)] text-[#f7efe3] shadow-[0_10px_24px_rgba(23,32,51,0.14)] transition hover:opacity-95"
            aria-label={locale === "zh" ? "发帖" : "Create post"}
          >
            <Plus className="size-4.5" />
          </button>
        </div>

        <div className="relative w-full rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.88)] p-2 shadow-[0_14px_36px_rgba(23,32,51,0.06)] backdrop-blur-md">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={text.searchPlaceholder}
            className="h-10 w-full rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/85 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--navy)]"
          />
        </div>

        <div className="px-1 text-xs text-[var(--ink-soft)]">
          {filteredAndSortedPosts.length} {text.threads}
        </div>
      </div>

      {showEmpty ? (
        <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.1)] bg-white/92 px-5 py-10 text-center text-sm text-[var(--ink-soft)] shadow-[0_8px_18px_rgba(23,32,51,0.04)]">
          {text.empty}
        </div>
      ) : null}

      {showNoResult ? (
        <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.1)] bg-white/92 px-5 py-10 text-center text-sm text-[var(--ink-soft)] shadow-[0_8px_18px_rgba(23,32,51,0.04)]">
          {text.noResult}
        </div>
      ) : null}

      {filteredAndSortedPosts.map((post) => (
        <article
          key={post.id}
          className="rounded-[1.35rem] border border-[rgba(20,50,75,0.1)] bg-white/92 p-4 shadow-[0_8px_18px_rgba(23,32,51,0.04)] transition hover:border-[rgba(20,50,75,0.16)] sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {post.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--navy)] px-2.5 py-1 text-[11px] font-semibold text-[#f7efe3]">
                    <Pin className="size-3.5" />
                    {text.pinned}
                  </span>
                )}

                <span className="rounded-full border border-[rgba(20,50,75,0.1)] bg-[rgba(255,251,246,0.88)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-soft)]">
                  {post.tag}
                </span>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-[var(--ink)] sm:text-[1.28rem]">
                {post.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {post.content}
              </p>
            </div>

            <div className="shrink-0 text-right text-xs text-[var(--ink-soft)]">
              <div className="font-medium text-[var(--ink)]">{post.author}</div>
              <div className="mt-1">{post.createdAt}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onLike(post.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                post.liked
                  ? "bg-[rgba(195,109,89,0.1)] text-[var(--coral)]"
                  : "border border-[rgba(20,50,75,0.1)] bg-white text-[var(--ink)] hover:bg-[rgba(255,251,246,0.88)]"
              }`}
            >
              <Heart className="size-4" />
              {post.likes}
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.1)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink)]">
              <MessageCircle className="size-4" />
              {post.comments.length} {text.comments}
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {post.comments.length === 0 ? (
              <div className="rounded-[1rem] border border-dashed border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.65)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                {text.noComments}
              </div>
            ) : (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,251,246,0.62)] p-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--ink)]">
                      {comment.author}
                    </span>
                    <span className="text-xs text-[var(--ink-soft)]">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-2.5">
            <input
              value={commentDrafts[post.id] || ""}
              onChange={(e) =>
                setCommentDrafts((prev) => ({
                  ...prev,
                  [post.id]: e.target.value,
                }))
              }
              placeholder={text.commentPlaceholder}
              className="h-10 flex-1 rounded-[1.1rem] border border-[rgba(20,50,75,0.1)] bg-white/90 px-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--navy)]"
            />

            <button
              type="button"
              onClick={() => handleSubmitComment(post.id)}
              className="inline-flex h-10 items-center justify-center rounded-[1.1rem] bg-[var(--navy)] px-4 text-sm font-medium text-[#f7efe3] transition hover:opacity-95"
            >
              {text.addComment}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default DiscussionBoard;