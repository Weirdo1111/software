"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  Bot,
  Grid2x2,
  Headphones,
  Heart,
  MessageCircle,
  Mic,
  Pin,
  Plus,
  ScrollText,
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
  selectedTag?: DiscussionCategory | "all";
  view?: ViewMode;
  search?: string;
  roleplayHref?: string;
  seminarHref?: string;
  onOpenComposer: () => void;
  onToggleLike?: (postId: string) => void;
  onSearchChange?: (value: string) => void;
  onSelectTag?: (value: DiscussionCategory | "all") => void;
  onSelectView?: (value: ViewMode) => void;
}

const categories: DiscussionCategory[] = [
  "grammar",
  "listening",
  "reading",
  "writing",
  "speaking",
  "assessment",
  "experience",
];

function formatRelativeDate(dateString: string, locale: Locale) {
  const date = new Date(dateString.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return locale === "zh" ? "刚刚" : "just now";
  }

  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const value = Math.max(1, Math.floor(diff / minute));
    return locale === "zh" ? `${value} 分钟前` : `${value}m ago`;
  }

  if (diff < day) {
    const value = Math.max(1, Math.floor(diff / hour));
    return locale === "zh" ? `${value} 小时前` : `${value}h ago`;
  }

  const value = Math.max(1, Math.floor(diff / day));
  return locale === "zh" ? `${value} 天前` : `${value}d ago`;
}

function getCategoryLabel(tag: DiscussionCategory, locale: Locale) {
  const map: Record<DiscussionCategory, { zh: string; en: string }> = {
    grammar: { zh: "语法", en: "Grammar" },
    listening: { zh: "听力", en: "Listening" },
    reading: { zh: "阅读", en: "Reading" },
    writing: { zh: "写作", en: "Writing" },
    speaking: { zh: "口语", en: "Speaking" },
    assessment: { zh: "测评", en: "Assessment" },
    experience: { zh: "经验分享", en: "Experience" },
  };

  return map[tag][locale];
}

function getCategoryIcon(tag: DiscussionCategory | "all") {
  const iconMap = {
    all: Grid2x2,
    grammar: BookOpen,
    listening: Headphones,
    reading: ScrollText,
    writing: SquarePen,
    speaking: Mic,
    assessment: TrendingUp,
    experience: MessageCircle,
  };

  return iconMap[tag];
}

function getInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
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

function getLikeButtonLabel(post: DiscussionPost, locale: Locale) {
  if (locale === "zh") {
    return post.liked ? `取消点赞：${post.title}` : `点赞：${post.title}`;
  }

  return post.liked ? `Unlike: ${post.title}` : `Like: ${post.title}`;
}

function getCommentLinkLabel(post: DiscussionPost, locale: Locale) {
  return locale === "zh" ? `查看评论：${post.title}` : `View comments: ${post.title}`;
}

export function DiscussionBoard({
  locale,
  posts,
  notifications,
  selectedTag = "all",
  view = "all",
  search = "",
  roleplayHref = "/lesson/A2-speaking-starter",
  seminarHref = "/discussion/seminars",
  onOpenComposer,
  onToggleLike,
  onSearchChange = () => undefined,
  onSelectTag = () => undefined,
  onSelectView = () => undefined,
}: DiscussionBoardProps) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  const text = {
    zh: {
      sideTitle: "论坛分类",
      heroTitle: "学习讨论社区",
      start: "发起讨论",
      search: "搜索感兴趣的话题...",
      all: "全部",
      latest: "最新",
      popular: "热门",
      empty: "当前没有匹配的讨论内容。",
      forumBrand: "LearnEnglishRight 社区",
      heroSubtitleAll: "浏览同学们的学习经验、问题与答疑。",
      heroSubtitleCategory: "当前板块",
      roleplay: "场景口语",
      seminars: "Seminar Rooms",
    },
    en: {
      sideTitle: "Categories",
      heroTitle: "Community Forum",
      start: "New Topic",
      search: "Search topics...",
      all: "All",
      latest: "Latest",
      popular: "Popular",
      empty: "No discussions found.",
      forumBrand: "LearnEnglishRight Community",
      heroSubtitleAll: "Browse study notes, questions, and peer discussion.",
      heroSubtitleCategory: "Current board",
      roleplay: "Roleplay",
      seminars: "Seminar Rooms",
    },
  }[locale];

  const filteredPosts = [...posts]
    .filter((post) => {
      const keyword = search.trim().toLowerCase();
      if (!keyword) return true;
      return [post.title, post.content, post.excerpt ?? "", post.author]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    })
    .filter((post) => (selectedTag === "all" ? true : post.tag === selectedTag))
    .sort((a, b) => {
      if (view === "latest") {
        return b.createdAt.localeCompare(a.createdAt);
      }

      if (view === "popular") {
        return b.likes + b.comments.length * 2 - (a.likes + a.comments.length * 2);
      }

      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="text-xl font-bold tracking-tight text-slate-900">{text.forumBrand}</div>
          </div>

          <div className="hidden max-w-md flex-1 lg:block">
            <div className="relative flex items-center rounded-xl bg-slate-100 px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20">
              <Search className="size-4 text-slate-500" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder={text.search}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/activity?lang=${locale}`}
              className="relative inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <Link
              href={roleplayHref}
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 lg:inline-flex"
            >
              <Bot className="size-4" />
              {text.roleplay}
            </Link>
            <Link
              href={seminarHref}
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 lg:inline-flex"
            >
              <MessageCircle className="size-4" />
              {text.seminars}
            </Link>
            <button
              type="button"
              onClick={onOpenComposer}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="size-4" />
              {text.start}
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 lg:hidden">
          <div className="relative flex items-center rounded-xl bg-white px-4 py-2.5 shadow-sm">
            <Search className="size-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder={text.search}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-28">
              <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                {text.sideTitle}
              </h2>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => onSelectTag("all")}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    selectedTag === "all"
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
                      type="button"
                      onClick={() => onSelectTag(category)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        selectedTag === category
                          ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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

          <main className="flex-1">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">{text.heroTitle}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedTag === "all"
                    ? text.heroSubtitleAll
                    : `${text.heroSubtitleCategory}：${getCategoryLabel(selectedTag, locale)}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100 p-1">
                {(["all", "latest", "popular"] as ViewMode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onSelectView(item)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      view === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item === "all" ? text.all : item === "latest" ? text.latest : text.popular}
                  </button>
                ))}
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-sm">
                {text.empty}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    <Link href={`/posts/${post.id}?lang=${locale}`} className="block">
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                            {getCategoryLabel(post.tag, locale)}
                          </span>
                          {post.pinned ? <Pin className="size-4 fill-amber-500 text-amber-500" /> : null}
                        </div>
                        <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-slate-900 group-hover:text-blue-600">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {post.excerpt || post.content}
                        </p>
                      </div>
                    </Link>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
                      <Link
                        href={`/posts/${post.id}?lang=${locale}`}
                        className="flex min-w-0 items-center gap-3"
                      >
                        <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {getInitial(post.author)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-800">{post.author}</div>
                          <div className="truncate text-[11px] text-slate-400">
                            {getLastActivityText(post, locale)}
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-4 text-slate-400">
                        <button
                          type="button"
                          onClick={() => onToggleLike?.(post.id)}
                          disabled={!onToggleLike}
                          aria-label={getLikeButtonLabel(post, locale)}
                          className={`flex items-center gap-1.5 transition ${
                            post.liked ? "text-rose-500" : "hover:text-rose-500"
                          } disabled:cursor-default disabled:hover:text-slate-400`}
                        >
                          <Heart className={`size-4 ${post.liked ? "fill-current" : ""}`} />
                          <span className="text-xs font-bold">{post.likes}</span>
                        </button>
                        <Link
                          href={`/posts/${post.id}?lang=${locale}`}
                          aria-label={getCommentLinkLabel(post, locale)}
                          className="flex items-center gap-1.5 transition hover:text-slate-600"
                        >
                          <MessageCircle className="size-4" />
                          <span className="text-xs font-bold">{post.comments.length}</span>
                        </Link>
                      </div>
                    </div>
                  </article>
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
