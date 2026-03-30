"use client";

import { useEffect, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

import { DiscussionBoard } from "@/components/discussion/discussion-board";
import { DiscussionRoleplayPanel } from "@/components/discussion/discussion-roleplay-panel";
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
  const [activePanel, setActivePanel] = useState<"discussion" | "roleplay">("discussion");
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
      dialogTitle: "\u53d1\u8d77\u65b0\u8ba8\u8bba",
      dialogSubtitle: "\u9996\u9875\u53ea\u5c55\u793a\u6458\u8981\uff0c\u5b8c\u6574\u5185\u5bb9\u4f1a\u5728\u5e16\u5b50\u8be6\u60c5\u9875\u4e2d\u663e\u793a\u3002",
      category: "\u5206\u7c7b",
      title: "\u6807\u9898",
      content: "\u6b63\u6587",
      cancel: "\u53d6\u6d88",
      publish: "\u53d1\u5e03",
      placeholderTitle: "\u8bf7\u8f93\u5165\u4e00\u4e2a\u6e05\u6670\u7684\u5e16\u5b50\u6807\u9898",
      placeholderContent: "\u5199\u4e0b\u4f60\u7684\u95ee\u9898\u3001\u80cc\u666f\u3001\u5206\u6790\u6216\u7ecf\u9a8c\u5206\u4eab\u2026\u2026",
      titleRequired: "\u6807\u9898\u548c\u6b63\u6587\u4e0d\u80fd\u4e3a\u7a7a",
      titleShort: "\u6807\u9898\u81f3\u5c11 6 \u4e2a\u5b57\u7b26",
      contentShort: "\u6b63\u6587\u81f3\u5c11 20 \u4e2a\u5b57\u7b26",
      categories: {
        grammar: "\u8bed\u6cd5",
        listening: "\u542c\u529b",
        writing: "\u5199\u4f5c",
        speaking: "\u53e3\u8bed",
        experience: "\u7ecf\u9a8c\u5206\u4eab",
      },
      panelDiscussion: "\u8ba8\u8bba\u533a",
      panelRoleplay: "\u4eba\u673a\u626e\u6f14\u5bf9\u8bdd",
      panelHintDiscussion: "\u6d4f\u89c8\u5e16\u5b50\u3001\u70b9\u8d5e\u4e92\u52a8\uff0c\u5e76\u53d1\u5e03\u65b0\u7684\u5b66\u4e60\u8bdd\u9898\u3002",
      panelHintRoleplay: "\u5728\u591a\u4e2a\u89d2\u8272\u4e4b\u95f4\u5207\u6362\uff0c\u8fdb\u884c\u6c89\u6d78\u5f0f\u5b9e\u65f6\u82f1\u8bed\u7ec3\u4e60\u3002",
      loading: "\u52a0\u8f7d\u4e2d...",
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
        writing: "Writing",
        speaking: "Speaking",
        experience: "Experience",
      },
      panelDiscussion: "Discussion",
      panelRoleplay: "Roleplay Chat",
      panelHintDiscussion: "Browse posts, react, and publish new topics.",
      panelHintRoleplay: "Switch between immersive realtime roleplay characters for English practice.",
      loading: "Loading...",
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
      null,
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
    >(res, null);

    if (!res.ok || !data || !("liked" in data)) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, liked: data.liked, likes: data.likes } : post,
      ),
    );

    const activityRes = await fetch("/api/discussion/activity", { cache: "no-store" });
    const activityJson = await readJsonOrFallback<{ notifications?: DiscussionNotification[] }>(
      activityRes,
      {},
    );
    setNotifications(activityJson.notifications ?? []);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="rounded-[1.8rem] border border-[#dbe5f4] bg-white/90 p-2 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActivePanel("discussion")}
              className={`rounded-[1.2rem] px-4 py-4 text-left transition ${
                activePanel === "discussion"
                  ? "bg-slate-900 text-white"
                  : "bg-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <MessageCircle className="size-4" />
                {text.panelDiscussion}
              </span>
              <p
                className={`mt-2 text-sm ${
                  activePanel === "discussion" ? "text-white/75" : "text-slate-500"
                }`}
              >
                {text.panelHintDiscussion}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActivePanel("roleplay")}
              className={`rounded-[1.2rem] px-4 py-4 text-left transition ${
                activePanel === "roleplay"
                  ? "bg-slate-900 text-white"
                  : "bg-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Bot className="size-4" />
                {text.panelRoleplay}
              </span>
              <p
                className={`mt-2 text-sm ${
                  activePanel === "roleplay" ? "text-white/75" : "text-slate-500"
                }`}
              >
                {text.panelHintRoleplay}
              </p>
            </button>
          </div>
        </div>
      </div>

      {activePanel === "discussion" ? (
        loading ? (
          <div className="p-8 text-sm text-slate-500">{text.loading}</div>
        ) : (
          <DiscussionBoard
            locale={locale}
            posts={posts}
            notifications={notifications}
            onOpenComposer={() => setOpenComposer(true)}
            onToggleLike={handleToggleLike}
          />
        )
      ) : (
        <DiscussionRoleplayPanel locale={locale} />
      )}

      {openComposer && activePanel === "discussion" && (
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
                  <h2 className="font-serif text-3xl text-[#030813]">{text.dialogTitle}</h2>
                  <p className="mt-2 text-sm text-[#45474C]">{text.dialogSubtitle}</p>
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
                  <option value="writing">{text.categories.writing}</option>
                  <option value="speaking">{text.categories.speaking}</option>
                  <option value="experience">{text.categories.experience}</option>
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
