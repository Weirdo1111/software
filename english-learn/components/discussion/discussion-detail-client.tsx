"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DiscussionDetail } from "@/components/discussion/discussion-detail";
import type {
  DiscussionComment,
  DiscussionCommentInput,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";

async function readJsonOrFallback<T>(response: Response, fallback: T): Promise<T> {
  if (!response.ok) return fallback;

  const text = await response.text();
  if (!text.trim()) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function readJsonBody<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function DiscussionDetailClient({
  locale,
  postId,
}: {
  locale: Locale;
  postId: string;
}) {
  const router = useRouter();
  const [commentDraft, setCommentDraft] = useState("");
  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      const res = await fetch(`/api/discussion/posts/${postId}`, {
        cache: "no-store",
      });
      const data = await readJsonOrFallback<DiscussionPost | null>(res, null);
      setPost(data);
      setLoading(false);
    };

    void loadPost();
  }, [postId]);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] px-6 py-20">
        <div className="mx-auto max-w-3xl bg-white px-8 py-10 shadow-sm">
          <h1 className="font-serif text-3xl text-[#030813]">Post not found</h1>
          <button
            type="button"
            onClick={() => router.push(`/discussion?lang=${locale}`)}
            className="mt-6 bg-[#030813] px-5 py-3 text-sm font-medium text-white"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const handleLike = async (targetPostId: string) => {
    const res = await fetch(`/api/discussion/posts/${targetPostId}/like`, {
      method: "POST",
    });
    const data = await readJsonOrFallback<{ liked: boolean; likes: number } | null>(
      res,
      null
    );

    if (!data) return;

    setPost((current) =>
      current
        ? { ...current, liked: data.liked, likes: data.likes }
        : current
    );
  };

  const handleAddComment = async (
    targetPostId: string,
    input: DiscussionCommentInput
  ) => {
    const trimmed = input.content.trim();
    if (!trimmed && !input.audioDataUrl) {
      return {
        ok: false,
        error: locale === "zh" ? "请输入文字或录制语音。" : "Add text or a voice message.",
      };
    }

    try {
      const res = await fetch(`/api/discussion/posts/${targetPostId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmed,
          audioDataUrl: input.audioDataUrl,
          audioMimeType: input.audioMimeType,
          audioDurationSec: input.audioDurationSec,
        }),
      });

      const payload = await readJsonBody<DiscussionComment | { error?: string }>(res);

      if (!res.ok) {
        return {
          ok: false,
          error:
            payload && "error" in payload && payload.error
              ? payload.error
              : locale === "zh"
                ? "评论发送失败。"
                : "Failed to post comment.",
        };
      }

      if (!payload || !("id" in payload)) {
        return {
          ok: false,
          error: locale === "zh" ? "评论发送失败。" : "Failed to post comment.",
        };
      }

      setPost((current) =>
        current
          ? {
              ...current,
              comments: [...current.comments, payload],
            }
          : current
      );
      setCommentDraft("");

      return { ok: true };
    } catch {
      return {
        ok: false,
        error: locale === "zh" ? "网络异常，评论未发送。" : "Network error. Comment was not posted.",
      };
    }
  };

  return (
    <div>
      <DiscussionDetail
        locale={locale}
        post={post}
        onLike={() => void handleLike(post.id)}
        onAddComment={(input) => handleAddComment(post.id, input)}
        commentDraft={commentDraft}
        setCommentDraft={setCommentDraft}
      />
    </div>
  );
}

export default DiscussionDetailClient;
