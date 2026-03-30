"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState, startTransition } from "react";
import { Send, X } from "lucide-react";

import { DiscussionBoard } from "@/components/discussion/discussion-board";
import type {
  DiscussionCategory,
  DiscussionNotification,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";

type DiscussionViewMode = "all" | "latest" | "popular";

async function readJsonOrFallback<T>(response: Response, fallback: T): Promise<T> {
  const text = await response.text();
  if (!text.trim()) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function normalizeCategory(value?: string): DiscussionCategory | "all" {
  if (!value || value === "all") return "all";

  const valid: Array<DiscussionCategory> = [
    "grammar",
    "listening",
    "reading",
    "writing",
    "speaking",
    "assessment",
    "experience",
  ];

  return valid.includes(value as DiscussionCategory) ? (value as DiscussionCategory) : "all";
}

function normalizeView(value?: string): DiscussionViewMode {
  return value === "latest" || value === "popular" ? value : "all";
}

export function DiscussionClient({
  locale,
  initialCategory,
  initialView,
  initialSearch,
}: {
  locale: Locale;
  initialCategory?: string;
  initialView?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [openComposer, setOpenComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<DiscussionCategory>("grammar");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [notifications, setNotifications] = useState<DiscussionNotification[]>([]);
  const [selectedTag, setSelectedTag] = useState<DiscussionCategory | "all">(() =>
    normalizeCategory(initialCategory),
  );
  const [view, setView] = useState<DiscussionViewMode>(() => normalizeView(initialView));
  const [search, setSearch] = useState(initialSearch ?? "");
  const deferredSearch = useDeferredValue(search);

  const text = {
    zh: {
      dialogTitle: "发起新讨论",
      dialogSubtitle: "论坛现在独立承担帖子、评论与通知流；角色扮演入口已拆分为单独空间。",
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
        assessment: "测评",
        experience: "经验分享",
      },
      loading: "加载中...",
    },
    en: {
      dialogTitle: "Start New Discussion",
      dialogSubtitle:
        "The forum now focuses on posts, comments, and notifications. Roleplay has been moved into its own space.",
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
        assessment: "Assessment",
        experience: "Experience",
      },
      loading: "Loading...",
    },
  }[locale];

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const activityRes = await fetch("/api/discussion/activity", { cache: "no-store" });
        const activityJson = await readJsonOrFallback<{ notifications?: DiscussionNotification[] }>(
          activityRes,
          {},
        );
        setNotifications(activityJson.notifications ?? []);
      } catch {
        setNotifications([]);
      }
    };

    void loadNotifications();
  }, []);

  const postsQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedTag !== "all") params.set("category", selectedTag);
    if (view !== "all") params.set("view", view);
    if (deferredSearch.trim()) params.set("search", deferredSearch.trim());
    return params.toString();
  }, [deferredSearch, selectedTag, view]);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);

      try {
        const postsRes = await fetch(`/api/discussion/posts${postsQuery ? `?${postsQuery}` : ""}`, {
          cache: "no-store",
        });
        const postsJson = await readJsonOrFallback<DiscussionPost[]>(postsRes, []);

        if (!cancelled) {
          setPosts(postsJson);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, [postsQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("lang", locale);
    if (selectedTag !== "all") params.set("category", selectedTag);
    if (view !== "all") params.set("view", view);
    if (deferredSearch.trim()) params.set("search", deferredSearch.trim());

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [deferredSearch, locale, pathname, router, selectedTag, view]);

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

    const result = await readJsonOrFallback<DiscussionPost | { error?: string } | null>(res, null);

    if (!res.ok) {
      const message =
        result && typeof result === "object" && "error" in result ? result.error : undefined;
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
      {loading ? (
        <div className="p-8 text-sm text-slate-500">{text.loading}</div>
      ) : (
        <DiscussionBoard
          locale={locale}
          posts={posts}
          notifications={notifications}
          selectedTag={selectedTag}
          view={view}
          search={search}
          roleplayHref={`/discussion/roleplay?lang=${locale}`}
          onSearchChange={setSearch}
          onSelectTag={setSelectedTag}
          onSelectView={setView}
          onOpenComposer={() => setOpenComposer(true)}
          onToggleLike={handleToggleLike}
        />
      )}

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
                  <option value="reading">{text.categories.reading}</option>
                  <option value="writing">{text.categories.writing}</option>
                  <option value="speaking">{text.categories.speaking}</option>
                  <option value="assessment">{text.categories.assessment}</option>
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
