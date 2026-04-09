"use client";

import { useEffect, useState } from "react";

import type { DiscussionPost, Locale } from "@/components/discussion/types";

async function readJsonOrFallback<T>(response: Response, fallback: T): Promise<T> {
  const text = await response.text();
  if (!text.trim()) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function DiscussionManagerReviewClient({ locale }: { locale: Locale }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [notice, setNotice] = useState("");

  const text = {
    zh: {
      loading: "加载待审核帖子中...",
      error: "加载审核列表失败。",
      empty: "当前没有待审核的帖子。",
      author: "发帖人",
      createdAt: "提交时间",
      category: "分类",
      approve: "同意发布",
      reject: "拒绝发布",
      approved: "帖子已同意发布。",
      rejected: "帖子已拒绝发布。",
      actionError: "操作失败，请稍后再试。",
    },
    en: {
      loading: "Loading pending posts...",
      error: "Failed to load the moderation queue.",
      empty: "There are no posts waiting for review.",
      author: "Author",
      createdAt: "Submitted",
      category: "Category",
      approve: "Approve",
      reject: "Reject",
      approved: "The post has been approved.",
      rejected: "The post has been rejected.",
      actionError: "Action failed. Please try again.",
    },
  }[locale];

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/discussion/moderation", { cache: "no-store" });
        const payload = await readJsonOrFallback<{ posts?: DiscussionPost[]; error?: string }>(
          response,
          {},
        );

        if (!response.ok) {
          throw new Error(payload.error || text.error);
        }

        if (!cancelled) {
          setPosts(payload.posts ?? []);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : text.error);
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [text.error]);

  const handleModeration = async (postId: string, decision: "approve" | "reject") => {
    setError("");
    setNotice("");

    const response = await fetch(`/api/discussion/posts/${postId}/moderation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decision }),
    });

    const payload = await readJsonOrFallback<DiscussionPost | { error?: string } | null>(response, null);

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "error" in payload ? payload.error : undefined;
      setError(message || text.actionError);
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setNotice(decision === "approve" ? text.approved : text.rejected);
  };

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">{text.loading}</div>;
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-sm">
          {text.empty}
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">
                    {post.tag}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">{post.title}</h2>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 ring-1 ring-amber-200">
                  {post.moderationStatus}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span>
                  {text.author}: <strong className="text-slate-800">{post.author}</strong>
                </span>
                <span>
                  {text.createdAt}: <strong className="text-slate-800">{post.createdAt}</strong>
                </span>
                <span>
                  {text.category}: <strong className="text-slate-800">{post.tag}</strong>
                </span>
              </div>

              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {post.content}
              </p>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => void handleModeration(post.id, "reject")}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  {text.reject}
                </button>
                <button
                  type="button"
                  onClick={() => void handleModeration(post.id, "approve")}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  {text.approve}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiscussionManagerReviewClient;
