"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Pin,
  Clock3,
  TrendingUp,
} from "lucide-react";

type Locale = "zh" | "en";

type DiscussionComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

type DiscussionPost = {
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

function loadPosts(): DiscussionPost[] {
  if (typeof window === "undefined") return defaultPosts;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPosts;

  try {
    return JSON.parse(raw) as DiscussionPost[];
  } catch {
    return defaultPosts;
  }
}

function savePosts(posts: DiscussionPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function DiscussionBoard({ locale }: { locale: Locale }) {
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("General");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setPosts(loadPosts());
  }, []);

  useEffect(() => {
    if (posts.length > 0) savePosts(posts);
  }, [posts]);

  const sortedPosts = useMemo(() => {
    const arr = [...posts];
    arr.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "popular") return b.likes - a.likes;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return arr;
  }, [posts, sort]);

  const text = {
    zh: {
      createPost: "发布讨论",
      title: "标题",
      content: "内容",
      tag: "标签",
      publish: "发布",
      latest: "最新",
      popular: "热门",
      comments: "评论",
      addComment: "发表评论",
      commentPlaceholder: "写下你的想法...",
      titlePlaceholder: "例如：如何准备下一次分级测评？",
      contentPlaceholder: "请输入你想讨论的问题、经验或建议。",
      empty: "当前还没有帖子，试着发布第一条讨论。",
    },
    en: {
      createPost: "Create discussion",
      title: "Title",
      content: "Content",
      tag: "Tag",
      publish: "Publish",
      latest: "Latest",
      popular: "Popular",
      comments: "Comments",
      addComment: "Add comment",
      commentPlaceholder: "Write your reply...",
      titlePlaceholder: "Example: How should I prepare for my next reassessment?",
      contentPlaceholder: "Share your question, strategy, or insight.",
      empty: "No discussions yet. Create the first one.",
    },
  }[locale];

  const handleCreatePost = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) return;

    const next: DiscussionPost = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      content: trimmedContent,
      author: "You",
      tag,
      likes: 0,
      liked: false,
      pinned: false,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      comments: [],
    };

    setPosts((prev) => [next, ...prev]);
    setTitle("");
    setContent("");
    setTag("General");
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const liked = !post.liked;
        return {
          ...post,
          liked,
          likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const draft = (commentDrafts[postId] || "").trim();
    if (!draft) return;

    const comment: DiscussionComment = {
      id: crypto.randomUUID(),
      author: "You",
      content: draft,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-2xl tracking-tight text-[var(--ink)]">
            {text.createPost}
          </h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSort("latest")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                sort === "latest"
                  ? "bg-[var(--navy)] text-[#f7efe3]"
                  : "border border-[rgba(20,50,75,0.14)] bg-white text-[var(--ink)]"
              }`}
            >
              <Clock3 className="size-4" />
              {text.latest}
            </button>

            <button
              type="button"
              onClick={() => setSort("popular")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                sort === "popular"
                  ? "bg-[var(--navy)] text-[#f7efe3]"
                  : "border border-[rgba(20,50,75,0.14)] bg-white text-[var(--ink)]"
              }`}
            >
              <TrendingUp className="size-4" />
              {text.popular}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <Field
            label={text.title}
            value={title}
            onChange={setTitle}
            placeholder={text.titlePlaceholder}
          />

          <Field
            label={text.tag}
            value={tag}
            onChange={setTag}
            placeholder="General"
          />

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[var(--ink)]">
              {text.content}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={text.contentPlaceholder}
              rows={6}
              className="rounded-[1.3rem] border border-[rgba(20,50,75,0.14)] bg-white/80 px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--navy)]"
            />
          </div>

          <button
            type="button"
            onClick={handleCreatePost}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
          >
            <Send className="size-4" />
            {text.publish}
          </button>
        </div>
      </section>

      <section className="grid gap-4">
        {sortedPosts.length === 0 ? (
          <div className="surface-panel rounded-[2rem] p-6 text-sm text-[var(--ink-soft)]">
            {text.empty}
          </div>
        ) : null}

        {sortedPosts.map((post) => (
          <article
            key={post.id}
            className="surface-panel rounded-[2rem] p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {post.pinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(20,50,75,0.14)] bg-[rgba(20,50,75,0.06)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                      <Pin className="size-3.5" />
                      Pinned
                    </span>
                  ) : null}

                  <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {post.tag}
                  </span>
                </div>

                <h3 className="font-display text-2xl tracking-tight text-[var(--ink)]">
                  {post.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  {post.content}
                </p>
              </div>

              <div className="text-right text-xs text-[var(--ink-soft)]">
                <div>{post.author}</div>
                <div className="mt-1">{post.createdAt}</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  post.liked
                    ? "bg-[rgba(195,109,89,0.12)] text-[var(--coral)]"
                    : "border border-[rgba(20,50,75,0.14)] bg-white text-[var(--ink)]"
                }`}
              >
                <Heart className="size-4" />
                {post.likes}
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.14)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                <MessageCircle className="size-4" />
                {post.comments.length} {text.comments}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[var(--ink)]">
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
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <input
                value={commentDrafts[post.id] || ""}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
                placeholder={text.commentPlaceholder}
                className="h-12 flex-1 rounded-full border border-[rgba(20,50,75,0.14)] bg-white px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--navy)]"
              />

              <button
                type="button"
                onClick={() => handleAddComment(post.id)}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--navy)] px-5 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
              >
                {text.addComment}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-[var(--ink)]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-[1.2rem] border border-[rgba(20,50,75,0.14)] bg-white/80 px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--navy)]"
      />
    </div>
  );
}