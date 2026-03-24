"use client";

import { use, useMemo, useState, useSyncExternalStore } from "react";
import { Plus, X, Send } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { DiscussionBoard } from "@/components/discussion/discussion-board";

type Locale = "zh" | "en";

export type DiscussionComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type DiscussionPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  tag: string;
  likes: number;
  liked: boolean;
  pinned: boolean;
  createdAt: string;
  comments: DiscussionComment[];
};

const STORAGE_KEY = "discussion_posts_v1";

const defaultPosts: DiscussionPost[] = [
  {
    id: "p1",
    title: "How should I prepare for reassessment next week?",
    content:
      "My current band is Medium. I want to know whether I should spend more time on speaking or reading before the next reassessment window opens.",
    author: "Shengze",
    tag: "Assessment",
    likes: 8,
    liked: false,
    pinned: true,
    createdAt: "2026-03-20 09:30",
    comments: [
      {
        id: "c1",
        author: "Tutor Team",
        content:
          "If speaking is lagging behind your reading metrics, prioritize one output task each day before reassessment.",
        createdAt: "2026-03-20 10:10",
      },
    ],
  },
  {
    id: "p2",
    title: "Useful strategy for academic listening note-taking",
    content:
      "I started splitting notes into keywords, argument flow, and evidence. It reduced overload during longer listening tasks.",
    author: "Mia",
    tag: "Listening",
    likes: 5,
    liked: false,
    pinned: false,
    createdAt: "2026-03-19 18:20",
    comments: [],
  },
];

const defaultPostsString = JSON.stringify(defaultPosts);

function subscribePosts(onStoreChange: () => void) {
  const handler = () => onStoreChange();

  window.addEventListener("storage", handler);
  window.addEventListener(
    "discussion-posts-changed",
    handler as EventListener
  );

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(
      "discussion-posts-changed",
      handler as EventListener
    );
  };
}

function getPostsSnapshot() {
  if (typeof window === "undefined") return defaultPostsString;
  return window.localStorage.getItem(STORAGE_KEY) ?? defaultPostsString;
}

function getPostsServerSnapshot() {
  return defaultPostsString;
}

function writePosts(nextPosts: DiscussionPost[]) {
  const serialized = JSON.stringify(nextPosts);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  window.dispatchEvent(new Event("discussion-posts-changed"));
}

interface DiscussionPageProps {
  searchParams: Promise<{
    lang?: string;
  }>;
}

export default function DiscussionPage({
  searchParams,
}: DiscussionPageProps) {
  const resolvedSearchParams = use(searchParams);
  const locale: Locale = resolvedSearchParams?.lang === "en" ? "en" : "zh";

  const [openComposer, setOpenComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(
    locale === "zh" ? "学习讨论" : "Discussion"
  );

  const postsRaw = useSyncExternalStore(
    subscribePosts,
    getPostsSnapshot,
    getPostsServerSnapshot
  );

  const posts = useMemo<DiscussionPost[]>(() => {
    try {
      return JSON.parse(postsRaw) as DiscussionPost[];
    } catch {
      return defaultPosts;
    }
  }, [postsRaw]);

  const copy = useMemo(
    () => ({
      pageTitle: locale === "zh" ? "讨论区" : "Discussion",
      pageDescription:
        locale === "zh"
          ? "围绕学习任务、分级测评、四项能力练习与反馈展开交流。"
          : "A focused discussion space for assessment, four-skill learning, feedback, and study strategy.",

      postTitle: locale === "zh" ? "发布帖子" : "Create a Post",
      postSubtitle:
        locale === "zh"
          ? "写下你的问题、经验或学习反馈。"
          : "Share your question, experience, or learning feedback.",

      inputTitle: locale === "zh" ? "帖子标题" : "Post Title",
      inputContent: locale === "zh" ? "帖子内容" : "Post Content",
      inputCategory: locale === "zh" ? "帖子分类" : "Category",

      titlePlaceholder:
        locale === "zh"
          ? "请输入一个清晰的标题"
          : "Write a clear title",
      contentPlaceholder:
        locale === "zh"
          ? "请输入帖子内容，例如你的问题、背景、练习反馈或经验分享"
          : "Write your content, question, feedback, or learning notes",

      cancel: locale === "zh" ? "取消" : "Cancel",
      submit: locale === "zh" ? "发送" : "Submit",
      emptyTitle:
        locale === "zh" ? "标题和内容不能为空" : "Title and content are required",

      categories:
        locale === "zh"
          ? ["学习讨论", "练习反馈", "测评分析", "经验分享"]
          : ["Discussion", "Feedback", "Assessment", "Experience"],
    }),
    [locale]
  );

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      alert(copy.emptyTitle);
      return;
    }

    const newPost: DiscussionPost = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      content: trimmedContent,
      author: "You",
      tag: category,
      likes: 0,
      liked: false,
      pinned: false,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      comments: [],
    };

    writePosts([newPost, ...posts]);

    setTitle("");
    setContent("");
    setCategory(copy.categories[0]);
    setOpenComposer(false);
  };

  const handleLike = (postId: string) => {
    const nextPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      const liked = !post.liked;

      return {
        ...post,
        liked,
        likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
      };
    });

    writePosts(nextPosts);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const newComment = {
      id: crypto.randomUUID(),
      author: "You",
      content: trimmed,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    const nextPosts = posts.map((post) =>
      post.id === postId
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    );

    writePosts(nextPosts);
  };

  return (
    <PageFrame
      locale={locale}
      title={copy.pageTitle}
      description={copy.pageDescription}
    >
      <div className="mx-auto w-full px-4 py-5 sm:px-6">
        <section className="rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.88)] p-2 shadow-[0_14px_36px_rgba(23,32,51,0.08)] backdrop-blur-md">
          <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.08)] bg-white/45 px-4 py-4 sm:px-5 sm:py-5">
            <DiscussionBoard
              locale={locale}
              posts={posts}
              onLike={handleLike}
              onAddComment={handleAddComment}
              onOpenComposer={() => setOpenComposer(true)}
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() => setOpenComposer(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--navy)] text-[#f7efe3] shadow-[0_12px_28px_rgba(23,32,51,0.2)] transition hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
          aria-label={copy.postTitle}
        >
          <Plus className="size-4.5" />
        </button>

        {openComposer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
            <div className="w-full max-w-xl rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,251,246,0.98)] shadow-[0_22px_50px_rgba(23,32,51,0.14)]">
              <div className="flex items-start justify-between border-b border-[rgba(20,50,75,0.08)] px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">
                    {copy.postTitle}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {copy.postSubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenComposer(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[1.1rem] text-[var(--ink-soft)] transition hover:bg-white/80 hover:text-[var(--ink)]"
                  aria-label={copy.cancel}
                >
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    {copy.inputCategory}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 w-full rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--navy)]"
                  >
                    {copy.categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    {copy.inputTitle}
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={copy.titlePlaceholder}
                    className="h-10 w-full rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)] transition focus:border-[var(--navy)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                    {copy.inputContent}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={copy.contentPlaceholder}
                    rows={7}
                    className="w-full rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)] transition focus:border-[var(--navy)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[rgba(20,50,75,0.08)] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpenComposer(false)}
                  className="inline-flex h-10 items-center justify-center rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/90 px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
                >
                  {copy.cancel}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.1rem] bg-[var(--navy)] px-4 text-sm font-medium text-[#f7efe3] transition hover:opacity-95"
                >
                  <Send className="size-4" />
                  {copy.submit}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageFrame>
  );
}