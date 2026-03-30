"use client";

import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";

import { DiscussionBoard } from "@/components/discussion/discussion-board";
import type {
  DiscussionCategory,
  DiscussionNotification,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";

async function readJsonOrFallback<T>(response: Response, fallback: T): Promise<T> {
  const text = await response.text();
  if (!text.trim()) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function DiscussionClient({ locale }: { locale: Locale }) {
  const [openComposer, setOpenComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<DiscussionCategory>("grammar");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [notifications, setNotifications] = useState<DiscussionNotification[]>([]);

  const text = {
    zh: {
      dialogTitle: "发起新讨论",
      dialogSubtitle: "首页只展示摘要，完整内容会在帖子详情页中展示。",
      category: "分类",
      title: "标题",
      content: "正文",
      cancel: "取消",
      publish: "发布",
      placeholderTitle: "请输入一个清晰的帖子标题",
      placeholderContent: "写下你的问题、背景、分析或经验分享……",
      titleRequired: "标题和正文不能为空",
      titleShort: "标题至少 6 个字符",
      contentShort: "正文至少 20 个字符",
      categories: {
        grammar: "语法",
        listening: "听力",
        reading: "阅读",
        writing: "写作",
        speaking: "口语",
        experience: "经验分享",
        assessment: "测评",
      },
    },
    en: {
      dialogTitle: "Start New Discussion",
      dialogSubtitle:
        "The homepage shows summaries only; full content appears on the detail page.",
      category: "Category",
      title: "Title",
      content: "Content",
      cancel: "Cancel",
      publish: "Publish",
      placeholderTitle: "Enter a clear topic title",
      placeholderContent:
        "Write your question, context, analysis, or learning experience...",
      titleRequired: "Title and content are required",
      titleShort: "Title must be at least 6 characters",
      contentShort: "Content must be at least 20 characters",
      categories: {
        grammar: "Grammar",
        listening: "Listening",
        reading: "Reading",
        writing: "Writing",
        speaking: "Speaking",
        experience: "Experience",
        assessment: "Assessment",
      },
    },
  }[locale];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [postsRes, activityRes] = await Promise.all([
          fetch("/api/discussion/posts", { cache: "no-store" }),
          fetch("/api/discussion/activity", { cache: "no-store" }),
        ]);

        const [postsJson, activityJson] = await Promise.all([
          readJsonOrFallback<DiscussionPost[]>(postsRes, []),
          readJsonOrFallback<{ notifications?: DiscussionNotification[] }>(activityRes, {}),
        ]);

        setPosts(postsJson);
        setNotifications(activityJson.notifications ?? []);
      } catch {
        setPosts([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError(text.titleRequired);
      return;
    }

    if (trimmedTitle.length < 6) {
      setError(text.titleShort);
      return;
    }

    if (trimmedContent.length < 20) {
      setError(text.contentShort);
      return;
    }

    const res = await fetch("/api/discussion/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: trimmedTitle, content: trimmedContent, category }),
    });

    const result = await readJsonOrFallback<DiscussionPost | { error?: string } | null>(
      res,
      null
    );

    if (!res.ok) {
      const message =
        result && typeof result === "object" && "error" in result
          ? result.error
          : undefined;
      setError(message || "Failed to create post");
      return;
    }

    const created =
      result && typeof result === "object" && "id" in result ? (result as DiscussionPost) : null;
    if (!created) {
      setError("Failed to create post");
      return;
    }

    setPosts((prev) => [created, ...prev]);
    setTitle("");
    setContent("");
    setCategory("grammar");
    setError("");
    setOpenComposer(false);
  };

  const handleToggleLike = async (postId: string) => {
    const res = await fetch(`/api/discussion/posts/${postId}/like`, {
      method: "POST",
    });

    const data = await readJsonOrFallback<
      { liked: boolean; likes: number } | { error?: string } | null
    >(
      res,
      null
    );

    if (!res.ok || !data || !("liked" in data)) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, liked: data.liked, likes: data.likes }
          : post
      )
    );

    const activityRes = await fetch("/api/discussion/activity", { cache: "no-store" });
    const activityJson = await readJsonOrFallback<{ notifications?: DiscussionNotification[] }>(
      activityRes,
      {}
    );
    setNotifications(activityJson.notifications ?? []);
  };

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading...</div>;
  }

  return (
    <>
      <DiscussionBoard
        locale={locale}
        posts={posts}
        notifications={notifications}
        onOpenComposer={() => setOpenComposer(true)}
        onToggleLike={handleToggleLike}
      />

      {openComposer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpenComposer(false)}
        >
          <div
            className="w-full max-w-3xl bg-[#f9f9ff] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#dde2f3] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl text-[#030813]">
                    {text.dialogTitle}
                  </h2>
                  <p className="mt-2 text-sm text-[#45474C]">
                    {text.dialogSubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenComposer(false)}
                  className="shrink-0 text-[#45474C]"
                  aria-label={text.cancel}
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#45474C]">
                  {text.category}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DiscussionCategory)}
                  className="h-12 w-full border border-[#c6c6cc] bg-white px-4 outline-none"
                >
                  <option value="grammar">{text.categories.grammar}</option>
                  <option value="listening">{text.categories.listening}</option>
                  <option value="reading">{text.categories.reading}</option>
                  <option value="writing">{text.categories.writing}</option>
                  <option value="speaking">{text.categories.speaking}</option>
                  <option value="experience">{text.categories.experience}</option>
                  <option value="assessment">{text.categories.assessment}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#45474C]">
                  {text.title}
                </label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={text.placeholderTitle}
                  className="w-full border border-[#c6c6cc] bg-white px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#45474C]">
                  {text.content}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={text.placeholderContent}
                  rows={10}
                  className="w-full resize-none border border-[#c6c6cc] bg-white px-4 py-3 outline-none"
                />
              </div>

              {error && (
                <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-[#dde2f3] pt-5">
                <button
                  type="button"
                  onClick={() => setOpenComposer(false)}
                  className="text-sm font-medium text-[#45474C]"
                >
                  {text.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 bg-[#030813] px-5 py-3 text-sm font-medium text-white"
                >
                  <Send className="size-4" />
                  {text.publish}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DiscussionClient;
