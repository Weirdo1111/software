"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Grid2x2,
  Headphones,
  Heart,
  MessageCircle,
  Mic,
  Pin,
  Plus,
  Search,
  SquarePen,
  TrendingUp,
} from "lucide-react";

import type {
  DiscussionCategory,
  DiscussionNotification,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";

type ViewMode = "all" | "latest" | "popular";

interface DiscussionBoardProps {
  locale: Locale;
  posts: DiscussionPost[];
  notifications: DiscussionNotification[];
  onOpenComposer: () => void;
  onToggleLike?: (postId: string) => void;
}

// --- 辅助函数 ---
function formatRelativeDate(dateString: string, locale: Locale) {
  const date = new Date(dateString.replace(" ", "T"));
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const value = Math.max(1, Math.floor(diff / minute));
    return locale === "zh" ? `${value} 分钟前` : `${value}m ago`;
  }
  if (diff < day) {
    const value = Math.floor(diff / hour);
    return locale === "zh" ? `${value} 小时前` : `${value}h ago`;
  }
  const value = Math.floor(diff / day);
  return locale === "zh" ? `${value} 天前` : `${value}d ago`;
}

function getCategoryLabel(tag: DiscussionCategory, locale: Locale) {
  const map = {
    grammar: { zh: "语法", en: "Grammar" },
    listening: { zh: "听力", en: "Listening" },
    reading: { zh: "阅读", en: "Reading" },
    writing: { zh: "写作", en: "Writing" },
    experience: { zh: "经验分享", en: "Experience" },
    speaking: { zh: "口语", en: "Speaking" },
    assessment: { zh: "测评", en: "Assessment" },
  };
  return map[tag][locale];
}

function getCategoryIcon(tag: DiscussionCategory | "all") {
  const iconMap = {
    all: Grid2x2,
    grammar: BookOpen,
    listening: Headphones,
    reading: BookOpen,
    writing: SquarePen,
    speaking: Mic,
    assessment: TrendingUp,
    experience: MessageCircle,
  };
  return iconMap[tag];
}

function getInitial(name: string) {
  return name.trim() ? name.trim().charAt(0).toUpperCase() : "U";
}

function getLastActivityText(post: DiscussionPost, locale: Locale) {
  if (post.comments.length > 0) {
    const lastComment = post.comments[post.comments.length - 1];
    return locale === "zh"
      ? `${lastComment.author} 回复于 ${formatRelativeDate(lastComment.createdAt, locale)}`
      : `${lastComment.author} replied ${formatRelativeDate(lastComment.createdAt, locale)}`;
  }
  return locale === "zh"
    ? `${post.author} 发布于 ${formatRelativeDate(post.createdAt, locale)}`
    : `${post.author} posted ${formatRelativeDate(post.createdAt, locale)}`;
}

// --- 主组件 ---
export function DiscussionBoard({
  locale,
  posts,
  notifications,
  onOpenComposer,
  onToggleLike,
}: DiscussionBoardProps) {
  const [view, setView] = useState<ViewMode>("all");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<DiscussionCategory | "all">("all");

  const unreadCount = notifications.filter((item) => !item.read).length;

  const text = {
    zh: {
      sideTitle: "板块分类",
      heroTitle: "学术交流社区",
      start: "发起讨论",
      search: "搜索感兴趣的话题...",
      all: "全部话题",
      latest: "最新发布",
      popular: "热门讨论",
      pinned: "置顶",
      empty: "当前暂无讨论内容。",
      forumCn: "LEARN ENGLISH RIGHT",
    },
    en: {
      sideTitle: "Categories",
      heroTitle: "Community Forum",
      start: "New Topic",
      search: "Search topics...",
      all: "All Topics",
      latest: "Latest",
      popular: "Popular",
      pinned: "Pinned",
      empty: "No discussions found.",
      forumCn: "LEARN ENGLISH RIGHT",
    },
  }[locale];

  const categories: DiscussionCategory[] = [
    "grammar",
    "listening",
    "reading",
    "writing",
    "speaking",
    "assessment",
    "experience",
  ];

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let list = [...posts];

    if (keyword) {
      list = list.filter((post) =>
        [post.title, post.content, post.author, post.excerpt ?? ""].join(" ").toLowerCase().includes(keyword)
      );
    }
    if (selectedTag !== "all") {
      list = list.filter((post) => post.tag === selectedTag);
    }
    if (view === "latest") {
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    if (view === "popular") {
      return list.sort((a, b) => b.comments.length * 2 + b.likes * 3 - (a.comments.length * 2 + a.likes * 3));
    }
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [posts, search, selectedTag, view]);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900">
      {/* 顶部导航：半透明模糊，适配 Frame 背景 */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {text.forumCn}
            </span>
          </div>

          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative flex items-center rounded-xl bg-slate-200/50 px-4 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
              <Search className="size-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder={text.search}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/activity"
              className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-200/50"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={onOpenComposer}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">{text.start}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* 侧边栏：使用透明设计 */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-28">
              <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                {text.sideTitle}
              </h2>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedTag("all")}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    selectedTag === "all"
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <Grid2x2 className="size-4" />
                  {text.all}
                </button>
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedTag(category)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        selectedTag === category
                          ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="size-4" />
                      {getCategoryLabel(category, locale)}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* 内容区 */}
          <main className="flex-1">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                  {text.heroTitle}
                </h1>
                <p className="mt-2 text-slate-500">{selectedTag === 'all' ? '探索社区最新动态' : `正在浏览 ${getCategoryLabel(selectedTag as DiscussionCategory, locale)}`}</p>
              </div>

              <div className="flex gap-1 rounded-xl bg-slate-200/50 p-1">
                {(["all", "latest", "popular"] as ViewMode[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setView(item)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                      view === item
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {item === "all" ? text.all : item === "latest" ? text.latest : text.popular}
                  </button>
                ))}
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                <p>{text.empty}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                          {getCategoryLabel(post.tag, locale)}
                        </span>
                        {post.pinned && <Pin className="size-3 text-amber-500 fill-amber-500" />}
                      </div>
                      <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-slate-900 group-hover:text-blue-600">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {post.excerpt || post.content}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {getInitial(post.author)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{post.author}</span>
                          <span className="text-[11px] text-slate-400">{getLastActivityText(post, locale)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-slate-400">
                        <div className={`flex items-center gap-1.5 ${post.liked ? 'text-rose-500' : ''}`}>
                          <Heart className={`size-4 ${post.liked ? 'fill-current' : ''}`} />
                          <span className="text-xs font-bold">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="size-4" />
                          <span className="text-xs font-bold">{post.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DiscussionBoard;
