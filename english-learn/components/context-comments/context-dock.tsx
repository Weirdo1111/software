"use client";

import { MessageSquareQuote, Send, ChevronDown, Heart, Sparkles } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import type {
  ContextComment,
  ContextCommentContext,
} from "@/lib/context-comments";
import {
  appendContextComment,
  getContextCommentsServerSnapshot,
  getContextCommentsSnapshot,
  getContextThread,
  subscribeContextComments,
  toggleContextCommentLike,
} from "@/lib/context-comments";
import type { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

function formatCommentTime(locale: Locale, value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildSummaryTopics(comments: ContextComment[], fallbackTopics: string[]) {
  const activeTopics = Array.from(
    new Set(comments.map((comment) => comment.topic).filter(Boolean)),
  ) as string[];

  return (activeTopics.length > 0 ? activeTopics : fallbackTopics).slice(0, 3);
}

export function ContextDock({
  locale,
  context,
  className,
}: {
  locale: Locale;
  context: ContextCommentContext;
  className?: string;
}) {
  const snapshot = useSyncExternalStore(
    subscribeContextComments,
    getContextCommentsSnapshot,
    getContextCommentsServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(context.topics[0] ?? "");
  const [status, setStatus] = useState("");

  const copy =
    locale === "zh"
      ? {
          title: "本页讨论",
          open: "展开",
          collapse: "收起",
          placeholder: "写下你的想法",
          publish: "发布",
          publishToPlaza: "同步到论坛",
          empty: "还没有评论",
          comments: "条评论",
          lastActive: "最近活跃",
          synced: "已同步论坛",
        }
      : {
          title: "Page discussion",
          open: "Open",
          collapse: "Collapse",
          placeholder: "Write your thought",
          publish: "Post",
          publishToPlaza: "Share to plaza",
          empty: "No comments yet",
          comments: "comments",
          lastActive: "Latest",
          synced: "Shared",
        };

  const thread = useMemo(
    () => getContextThread(context, snapshot),
    [context, snapshot],
  );
  const comments = useMemo(
    () =>
      [...thread.comments].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    [thread.comments],
  );
  const summaryTopics = useMemo(
    () => buildSummaryTopics(comments, context.topics),
    [comments, context.topics],
  );
  const lastActive = comments[0]?.createdAt
    ? formatCommentTime(locale, comments[0].createdAt)
    : null;

  function handlePublish(promoteToDiscussion: boolean) {
    const trimmed = draft.trim();
    if (!trimmed) return;

    appendContextComment(context, {
      content: trimmed,
      topic: selectedTopic || undefined,
      promoteToDiscussion,
      locale,
    });
    setDraft("");
    setStatus(promoteToDiscussion ? copy.synced : "");
  }

  return (
    <section
      className={cn(
        "rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-white/92 p-4 shadow-[0_14px_36px_rgba(23,32,51,0.06)] sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[rgba(20,50,75,0.08)] text-[var(--navy)]">
            <MessageSquareQuote className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {copy.title}
            </p>
            <h3 className="truncate text-lg font-semibold tracking-tight text-[var(--ink)]">
              {context.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--navy)] hover:text-[var(--navy)]"
        >
          {isOpen ? copy.collapse : copy.open}
          <ChevronDown
            className={cn("size-4 transition-transform", isOpen ? "rotate-180" : "")}
          />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">
          {comments.length} {copy.comments}
        </span>
        {lastActive ? (
          <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">
            {copy.lastActive} {lastActive}
          </span>
        ) : null}
        {summaryTopics.map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-[rgba(20,50,75,0.06)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]"
          >
            {topic}
          </span>
        ))}
      </div>

      {isOpen ? (
        <div className="mt-5 grid gap-4">
          <div className="flex flex-wrap gap-2">
            {context.topics.map((topic) => {
              const isActive = selectedTopic === topic;

              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--navy)] text-[#f7efe3]"
                      : "border border-[rgba(20,50,75,0.12)] bg-white text-[var(--ink)] hover:border-[var(--navy)] hover:text-[var(--navy)]",
                  )}
                >
                  {topic}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {context.starters.slice(0, 3).map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => setDraft(starter)}
                className="rounded-full border border-dashed border-[rgba(20,50,75,0.16)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:border-[var(--navy)] hover:text-[var(--navy)]"
              >
                {starter}
              </button>
            ))}
          </div>

          <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.1)] bg-[rgba(247,250,252,0.72)] p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={copy.placeholder}
              rows={4}
              className="min-h-28 w-full resize-none bg-transparent px-1 py-1 text-sm leading-7 text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)]"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">
                {selectedTopic}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePublish(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--navy)] hover:text-[var(--navy)]"
                >
                  <Send className="size-4" />
                  {copy.publish}
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-[#f7efe3] transition hover:opacity-95"
                >
                  <Sparkles className="size-4" />
                  {copy.publishToPlaza}
                </button>
              </div>
            </div>
            {status ? (
              <p className="mt-3 text-sm font-medium text-[#315f4f]">{status}</p>
            ) : null}
          </div>

          {comments.length > 0 ? (
            <div className="grid max-h-[24rem] gap-3 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[1.2rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,251,246,0.7)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {comment.author}
                        </p>
                        {comment.topic ? (
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-soft)]">
                            {comment.topic}
                          </span>
                        ) : null}
                        {comment.promotedAt ? (
                          <span className="rounded-full bg-[rgba(106,148,131,0.14)] px-2.5 py-1 text-[11px] font-semibold text-[#285f4d]">
                            {copy.synced}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-[var(--ink-soft)]">
                        {formatCommentTime(locale, comment.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toggleContextCommentLike(context, comment.id)
                      }
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        comment.liked
                          ? "bg-[rgba(195,109,89,0.12)] text-[var(--coral)]"
                          : "border border-[rgba(20,50,75,0.12)] bg-white text-[var(--ink-soft)] hover:text-[var(--ink)]",
                      )}
                    >
                      <Heart className="size-3.5" />
                      {comment.likes}
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                    {comment.content}
                  </p>
                  {comment.anchorLabel && comment.anchorText ? (
                    <div className="mt-3 rounded-[1rem] bg-white/88 px-3 py-2 text-sm text-[var(--ink-soft)]">
                      <span className="font-semibold text-[var(--ink)]">
                        {comment.anchorLabel}
                      </span>{" "}
                      {comment.anchorText}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.62)] px-4 py-6 text-center text-sm text-[var(--ink-soft)]">
              {copy.empty}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
