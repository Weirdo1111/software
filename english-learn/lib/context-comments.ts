import type { Locale } from "@/lib/i18n/dictionaries";
import { normalizeDiscussionCategory } from "@/components/discussion/types";
import { appendDiscussionPost } from "@/lib/discussion-store";

export type ContextCommentModule =
  | "listening"
  | "speaking"
  | "reading"
  | "writing";

export type ContextComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  topic?: string;
  likes: number;
  liked: boolean;
  anchorLabel?: string;
  anchorText?: string;
  promotedAt?: string;
};

export type ContextCommentThread = {
  id: string;
  module: ContextCommentModule;
  targetId: string;
  title: string;
  subtitle?: string;
  updatedAt: string;
  comments: ContextComment[];
};

export type ContextCommentSeed = {
  author: string;
  content: string;
  createdAt: string;
  topic?: string;
  likes?: number;
  anchorLabel?: string;
  anchorText?: string;
  promotedAt?: string;
};

export type ContextCommentContext = {
  module: ContextCommentModule;
  targetId: string;
  title: string;
  subtitle?: string;
  plazaTag: string;
  topics: string[];
  starters: string[];
  seedComments?: ContextCommentSeed[];
};

type ContextCommentDraft = {
  content: string;
  topic?: string;
  anchorLabel?: string;
  anchorText?: string;
  author?: string;
  promoteToDiscussion?: boolean;
  locale?: Locale;
};

const CONTEXT_STORAGE_KEY = "context_comment_threads_v1";
const CONTEXT_CHANGE_EVENT = "context-comments-changed";
const DEFAULT_CONTEXT_THREADS: ContextCommentThread[] = [];
const DEFAULT_CONTEXT_THREADS_STRING = JSON.stringify(DEFAULT_CONTEXT_THREADS);

function buildCommentId() {
  return globalThis.crypto?.randomUUID?.() ?? `comment-${Date.now()}`;
}

function buildThreadId(module: ContextCommentModule, targetId: string) {
  return `${module}:${targetId}`;
}

function formatPlazaDate(date: Date) {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function isContextComment(value: unknown): value is ContextComment {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.author === "string" &&
    typeof record.content === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.likes === "number" &&
    typeof record.liked === "boolean"
  );
}

function isContextThread(value: unknown): value is ContextCommentThread {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.module === "string" &&
    typeof record.targetId === "string" &&
    typeof record.title === "string" &&
    typeof record.updatedAt === "string" &&
    Array.isArray(record.comments) &&
    record.comments.every(isContextComment)
  );
}

function isContextThreadArray(value: unknown): value is ContextCommentThread[] {
  return Array.isArray(value) && value.every(isContextThread);
}

function createSeedComment(
  seed: ContextCommentSeed,
  index: number,
): ContextComment {
  return {
    id: `seed-${index}-${seed.author.replace(/\s+/g, "-").toLowerCase()}`,
    author: seed.author,
    content: seed.content,
    createdAt: seed.createdAt,
    topic: seed.topic,
    likes: seed.likes ?? 0,
    liked: false,
    anchorLabel: seed.anchorLabel,
    anchorText: seed.anchorText,
    promotedAt: seed.promotedAt,
  };
}

function buildSeedThread(context: ContextCommentContext): ContextCommentThread {
  const comments = (context.seedComments ?? []).map(createSeedComment);
  const fallbackUpdatedAt =
    comments[comments.length - 1]?.createdAt ?? "2026-03-25T08:00:00.000Z";

  return {
    id: buildThreadId(context.module, context.targetId),
    module: context.module,
    targetId: context.targetId,
    title: context.title,
    subtitle: context.subtitle,
    updatedAt: fallbackUpdatedAt,
    comments,
  };
}

function hydrateThread(
  thread: ContextCommentThread,
  context: ContextCommentContext,
) {
  return {
    ...thread,
    title: context.title,
    subtitle: context.subtitle,
  };
}

function upsertThread(
  threads: ContextCommentThread[],
  nextThread: ContextCommentThread,
) {
  const nextIndex = threads.findIndex((thread) => thread.id === nextThread.id);

  if (nextIndex === -1) {
    return [...threads, nextThread];
  }

  return threads.map((thread, index) =>
    index === nextIndex ? nextThread : thread,
  );
}

function readThreadsFromRaw(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isContextThreadArray(parsed) ? parsed : DEFAULT_CONTEXT_THREADS;
  } catch {
    return DEFAULT_CONTEXT_THREADS;
  }
}

function readThreads() {
  return readThreadsFromRaw(getContextCommentsSnapshot());
}

function writeThreads(nextThreads: ContextCommentThread[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(nextThreads));
  window.dispatchEvent(new Event(CONTEXT_CHANGE_EVENT));
}

function writeThreadSnapshot(nextThread: ContextCommentThread) {
  const threads = readThreads();
  writeThreads(upsertThread(threads, nextThread));
}

function buildDiscussionTitle(
  context: ContextCommentContext,
  comment: ContextComment,
) {
  if (comment.topic) {
    return `${context.title} · ${comment.topic}`;
  }

  return `${context.title} · Discussion`;
}

function buildDiscussionContent(comment: ContextComment) {
  if (comment.anchorLabel && comment.anchorText) {
    return `${comment.content}\n\n${comment.anchorLabel}: ${comment.anchorText}`;
  }

  return comment.content;
}

export function subscribeContextComments(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(CONTEXT_CHANGE_EVENT, handler as EventListener);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CONTEXT_CHANGE_EVENT, handler as EventListener);
  };
}

export function getContextCommentsSnapshot() {
  if (typeof window === "undefined") {
    return DEFAULT_CONTEXT_THREADS_STRING;
  }

  return (
    window.localStorage.getItem(CONTEXT_STORAGE_KEY) ??
    DEFAULT_CONTEXT_THREADS_STRING
  );
}

export function getContextCommentsServerSnapshot() {
  return DEFAULT_CONTEXT_THREADS_STRING;
}

export function getContextThread(
  context: ContextCommentContext,
  rawSnapshot?: string,
) {
  const threads =
    typeof rawSnapshot === "string"
      ? readThreadsFromRaw(rawSnapshot)
      : readThreads();
  const existing = threads.find(
    (thread) => thread.id === buildThreadId(context.module, context.targetId),
  );

  if (existing) {
    return hydrateThread(existing, context);
  }

  return buildSeedThread(context);
}

export async function hydrateContextThreadFromServer(
  context: ContextCommentContext,
) {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams({
      module: context.module,
      targetId: context.targetId,
      title: context.title,
      plazaTag: context.plazaTag,
    });

    if (context.subtitle) {
      params.set("subtitle", context.subtitle);
    }

    const response = await fetch(`/api/context-comments?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      thread?: ContextCommentThread | null;
    };

    if (!payload.thread) return null;

    const nextThread = hydrateThread(payload.thread, context);
    writeThreadSnapshot(nextThread);
    return nextThread;
  } catch {
    return null;
  }
}

async function persistContextCommentToServer(
  context: ContextCommentContext,
  comment: ContextComment,
) {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch("/api/context-comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context,
        comment: {
          id: comment.id,
          author: comment.author,
          content: comment.content,
          createdAt: comment.createdAt,
          topic: comment.topic,
          anchorLabel: comment.anchorLabel,
          anchorText: comment.anchorText,
          promotedAt: comment.promotedAt,
        },
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function persistContextLikeToServer(commentId: string) {
  if (typeof window === "undefined") return false;
  if (!/^[0-9a-fA-F-]{36}$/.test(commentId)) return false;

  try {
    const response = await fetch("/api/context-comments", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commentId }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function appendContextComment(
  context: ContextCommentContext,
  draft: ContextCommentDraft,
) {
  const now = new Date();
  const threads = readThreads();
  const currentThread = getContextThread(context);
  const nextComment: ContextComment = {
    id: buildCommentId(),
    author: draft.author ?? "You",
    content: draft.content.trim(),
    createdAt: now.toISOString(),
    topic: draft.topic,
    likes: 0,
    liked: false,
    anchorLabel: draft.anchorLabel,
    anchorText: draft.anchorText,
    promotedAt: draft.promoteToDiscussion ? now.toISOString() : undefined,
  };

  const nextThread: ContextCommentThread = {
    ...hydrateThread(currentThread, context),
    updatedAt: nextComment.createdAt,
    comments: [...currentThread.comments, nextComment],
  };

  writeThreads(upsertThread(threads, nextThread));
  void persistContextCommentToServer(context, nextComment);

  if (draft.promoteToDiscussion) {
    appendDiscussionPost({
      id: globalThis.crypto?.randomUUID?.() ?? `plaza-${Date.now()}`,
      title: buildDiscussionTitle(context, nextComment),
      content: buildDiscussionContent(nextComment),
      author: nextComment.author,
      tag: normalizeDiscussionCategory(context.plazaTag),
      likes: 0,
      liked: false,
      pinned: false,
      createdAt: formatPlazaDate(now),
      comments: [],
      views: 0,
    });
  }

  return nextComment;
}

export function toggleContextCommentLike(
  context: ContextCommentContext,
  commentId: string,
) {
  const threads = readThreads();
  const currentThread = getContextThread(context);
  const nextThread: ContextCommentThread = {
    ...hydrateThread(currentThread, context),
    comments: currentThread.comments.map((comment) => {
      if (comment.id !== commentId) return comment;

      const liked = !comment.liked;

      return {
        ...comment,
        liked,
        likes: liked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
      };
    }),
  };

  writeThreads(upsertThread(threads, nextThread));
  void persistContextLikeToServer(commentId);
}
