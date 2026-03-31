"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
<<<<<<< Updated upstream
  Bot,
=======
  ClipboardList,
  FileText,
>>>>>>> Stashed changes
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
  selectedTag: DiscussionCategory | "all";
  view: ViewMode;
  search: string;
  roleplayHref: string;
  seminarHref: string;
  onOpenComposer: () => void;
  onToggleLike?: (postId: string) => void;
  onSearchChange: (value: string) => void;
  onSelectTag: (value: DiscussionCategory | "all") => void;
  onSelectView: (value: ViewMode) => void;
}

<<<<<<< Updated upstream
=======
const categoryOrder: DiscussionCategory[] = [
  "grammar",
  "listening",
  "reading",
  "writing",
  "speaking",
  "assessment",
  "experience",
];

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const value = Math.floor(diff / day);
=======
  const value = Math.max(1, Math.floor(diff / day));
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    reading: ScrollText,
    writing: SquarePen,
    speaking: Mic,
    assessment: TrendingUp,
    experience: MessageCircle,
=======
    reading: FileText,
    writing: SquarePen,
    speaking: Mic,
    assessment: ClipboardList,
    experience: TrendingUp,
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
function getLikeButtonLabel(post: DiscussionPost, locale: Locale) {
  if (locale === "zh") {
    return post.liked ? `取消点赞：${post.title}` : `点赞：${post.title}`;
  }

  return post.liked ? `Unlike: ${post.title}` : `Like: ${post.title}`;
}

function getCommentsLinkLabel(post: DiscussionPost, locale: Locale) {
  if (locale === "zh") {
    return `查看评论：${post.title}`;
  }

  return `View comments: ${post.title}`;
}

>>>>>>> Stashed changes
export function DiscussionBoard({
  locale,
  posts,
  notifications,
  selectedTag,
  view,
  search,
  roleplayHref,
  seminarHref,
  onOpenComposer,
  onToggleLike,
  onSearchChange,
  onSelectTag,
  onSelectView,
}: DiscussionBoardProps) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  const text = {
    zh: {
<<<<<<< Updated upstream
      sideTitle: "论坛分类",
      heroTitle: "学习讨论论坛",
      start: "发起讨论",
      search: "搜索讨论主题...",
      all: "全部",
      latest: "最新",
      popular: "热门",
      empty: "当前暂无讨论内容。",
      forumCn: "学术论坛",
      roleplay: "Roleplay",
      seminars: "Seminar Rooms",
      queryAll: "查看社区里的最新讨论动态",
      querySearch: "当前结果来自论坛实时查询：",
=======
      sideTitle: "板块分类",
      heroTitle: "学习讨论社区",
      start: "发起讨论",
      search: "搜索感兴趣的话题...",
      all: "全部话题",
      latest: "最新发布",
      popular: "热门讨论",
      empty: "当前没有匹配的讨论内容。",
      forumBrand: "LEARN ENGLISH RIGHT",
      heroSubtitleAll: "探索社区里的最新动态与学习经验。",
      heroSubtitleCategory: "正在浏览",
>>>>>>> Stashed changes
    },
    en: {
      sideTitle: "Categories",
      heroTitle: "Community Forum",
      start: "New Topic",
      search: "Search topics...",
      all: "All Topics",
      latest: "Latest",
      popular: "Popular",
      empty: "No discussions found.",
<<<<<<< Updated upstream
      forumCn: "Academic Forum",
      roleplay: "Roleplay",
      seminars: "Seminar Rooms",
      queryAll: "Explore the latest community updates",
      querySearch: "Results are now driven by the live forum query:",
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

  const querySubtitle = search.trim()
    ? `${text.querySearch} "${search.trim()}"`
    : selectedTag === "all"
      ? text.queryAll
      : `Browsing ${getCategoryLabel(selectedTag, locale)}`;

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#1b2430]">
      <header className="sticky top-0 z-50 border-b border-[#e9eef5] bg-[rgba(255,255,255,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <div className="min-w-[220px]">
            <div className="flex items-center gap-2 text-[28px] font-semibold tracking-[-0.02em] text-[#111827]">
              <span>LearnEnglishRight</span>
              <span className="text-[#9aa4b2]">|</span>
              <span className="text-[#111827]">{text.forumCn}</span>
            </div>
          </div>

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="flex w-full max-w-[460px] items-center rounded-full border border-[#d8e1ee] bg-white px-4 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
              <Search className="mr-3 size-4 text-[#8b97a8]" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full border-none bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9aa4b2]"
=======
      forumBrand: "LEARN ENGLISH RIGHT",
      heroSubtitleAll: "Explore the latest community activity and learning notes.",
      heroSubtitleCategory: "Browsing",
    },
  }[locale];

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let list = [...posts];

    if (keyword) {
      list = list.filter((post) =>
        [post.title, post.content, post.author, post.excerpt ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(keyword),
      );
    }

    if (selectedTag !== "all") {
      list = list.filter((post) => post.tag === selectedTag);
    }

    if (view === "latest") {
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    if (view === "popular") {
      return list.sort(
        (a, b) =>
          b.comments.length * 2 + b.likes * 3 - (a.comments.length * 2 + a.likes * 3),
      );
    }

    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [posts, search, selectedTag, view]);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-slate-900">{text.forumBrand}</span>
          </div>

          <div className="hidden max-w-md flex-1 lg:block">
            <div className="relative flex items-center rounded-xl bg-slate-200/50 px-4 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
              <Search className="size-4 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
>>>>>>> Stashed changes
                placeholder={text.search}
              />
            </div>
          </div>

          <div className="flex min-w-[220px] items-center justify-end gap-3">
            <Link
              href={`/activity?lang=${locale}`}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e3eaf4] bg-white text-[#1f2937] shadow-sm transition hover:bg-[#f8fbff]"
            >
              <Bell className="size-5" />
<<<<<<< Updated upstream
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">
=======
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
>>>>>>> Stashed changes
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>

            <Link
              href={roleplayHref}
              className="hidden items-center gap-2 rounded-full border border-[#d8e1ee] bg-white px-4 py-2.5 text-sm font-medium text-[#1f2937] shadow-sm transition hover:bg-[#f8fbff] lg:inline-flex"
            >
              <Bot className="size-4" />
              {text.roleplay}
            </Link>

            <Link
              href={seminarHref}
              className="hidden items-center gap-2 rounded-full border border-[#d8e1ee] bg-white px-4 py-2.5 text-sm font-medium text-[#1f2937] shadow-sm transition hover:bg-[#f8fbff] lg:inline-flex"
            >
              <MessageCircle className="size-4" />
              {text.seminars}
            </Link>

            <button
              type="button"
              onClick={onOpenComposer}
              className="inline-flex items-center gap-2 rounded-full bg-[#2f6df6] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_20px_rgba(47,109,246,0.22)] transition hover:bg-[#255fe0]"
            >
              <Plus className="size-4" />
              {text.start}
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 lg:hidden">
          <div className="flex items-center rounded-full border border-[#d8e1ee] bg-white px-4 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
            <Search className="mr-3 size-4 text-[#8b97a8]" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border-none bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9aa4b2]"
              placeholder={text.search}
            />
          </div>
        </div>
      </header>

<<<<<<< Updated upstream
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-[calc(100vh-81px)] w-[250px] shrink-0 bg-[#eef2ff] px-5 py-8 md:block">
          <h2 className="mb-6 px-2 text-lg font-semibold text-[#1f2937]">{text.sideTitle}</h2>

          <nav className="space-y-2">
            <button
              onClick={() => onSelectTag("all")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                selectedTag === "all"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#4b5563] hover:bg-[#e5ecff]"
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
                  onClick={() => onSelectTag(category)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    selectedTag === category
                      ? "bg-white text-[#111827] shadow-sm"
                      : "text-[#4b5563] hover:bg-[#e5ecff]"
=======
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-28">
              <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                {text.sideTitle}
              </h2>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedTag("all")}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    selectedTag === "all"
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
>>>>>>> Stashed changes
                  }`}
                >
                  <Icon className="size-4" />
                  {getCategoryLabel(category, locale)}
                </button>
<<<<<<< Updated upstream
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 px-6 py-8 lg:px-10">
          <section className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-[4px] rounded-full bg-[#2f6df6]" />
                <div>
                  <h1 className="text-[36px] font-medium leading-none tracking-[-0.03em] text-[#1f2937] md:text-[42px]">
                    {text.heroTitle}
                  </h1>
                  <p className="mt-3 text-sm text-[#6b7280]">{querySubtitle}</p>
                </div>
=======
                {categoryOrder.map((category) => {
                  const Icon = getCategoryIcon(category);

                  return (
                    <button
                      key={category}
                      type="button"
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

          <main className="flex-1">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">{text.heroTitle}</h1>
                <p className="mt-2 text-slate-500">
                  {selectedTag === "all"
                    ? text.heroSubtitleAll
                    : `${text.heroSubtitleCategory} ${getCategoryLabel(selectedTag, locale)}`}
                </p>
>>>>>>> Stashed changes
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {(["all", "latest", "popular"] as ViewMode[]).map((item) => (
                  <button
                    key={item}
<<<<<<< Updated upstream
                    onClick={() => onSelectView(item)}
                    className={`rounded-full border px-6 py-2.5 text-sm font-medium transition ${
                      view === item
                        ? "border-[#2f6df6] bg-[#eef4ff] text-[#2f6df6]"
                        : "border-[#d6deea] bg-white text-[#4b5563] hover:bg-[#f8fbff]"
=======
                    type="button"
                    onClick={() => setView(item)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                      view === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
>>>>>>> Stashed changes
                    }`}
                  >
                    {item === "all" ? text.all : item === "latest" ? text.latest : text.popular}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            {posts.length === 0 ? (
              <div className="bg-white px-6 py-10 text-sm text-[#4b5563] shadow-sm">{text.empty}</div>
            ) : (
<<<<<<< Updated upstream
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}?lang=${locale}`}
                    className="group flex min-h-[300px] flex-col border border-[#edf1f6] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                          {getCategoryLabel(post.tag, locale)}
                        </span>
                        {post.pinned ? (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f6e8c7] text-[#8a6a2f]">
                            <Pin className="size-4" />
                          </span>
                        ) : (
                          <span className="h-9 w-9" />
                        )}
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
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f6df6] text-sm font-bold text-white">
                          {getInitial(post.author)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{post.author}</span>
                          <span className="text-[11px] text-slate-400">
=======
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
                  >
                    <Link href={`/posts/${post.id}`} className="block">
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                            {getCategoryLabel(post.tag, locale)}
                          </span>
                          {post.pinned ? <Pin className="size-3 fill-amber-500 text-amber-500" /> : null}
                        </div>
                        <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-slate-900 group-hover:text-blue-600">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {post.excerpt || post.content}
                        </p>
                      </div>
                    </Link>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                      <Link href={`/posts/${post.id}`} className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                          {getInitial(post.author)}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-bold text-slate-800">{post.author}</span>
                          <span className="truncate text-[11px] text-slate-400">
>>>>>>> Stashed changes
                            {getLastActivityText(post, locale)}
                          </span>
                        </div>
                      </Link>

<<<<<<< Updated upstream
                      <div className="flex shrink-0 items-center gap-5 text-sm text-[#6b7280]">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onToggleLike?.(post.id);
                          }}
                          className={`inline-flex items-center gap-1.5 transition ${
                            post.liked ? "text-rose-600" : "text-[#6b7280] hover:text-[#2f6df6]"
                          }`}
                          aria-pressed={post.liked}
                        >
                          <Heart
                            className={`size-4 ${post.liked ? "fill-current text-rose-600" : ""}`}
                          />
                          <span>{post.likes}</span>
                        </button>

                        <div className="inline-flex items-center gap-1.5">
                          <MessageCircle className="size-4" />
                          <span>{post.comments.length}</span>
                        </div>
=======
                      <div className="flex items-center gap-4 text-slate-400">
                        <button
                          type="button"
                          onClick={() => onToggleLike?.(post.id)}
                          disabled={!onToggleLike}
                          aria-label={getLikeButtonLabel(post, locale)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            post.liked ? "text-rose-500" : "hover:text-rose-500"
                          } disabled:cursor-default disabled:hover:text-slate-400`}
                        >
                          <Heart className={`size-4 ${post.liked ? "fill-current" : ""}`} />
                          <span className="text-xs font-bold">{post.likes}</span>
                        </button>
                        <Link
                          href={`/posts/${post.id}`}
                          aria-label={getCommentsLinkLabel(post, locale)}
                          className="flex items-center gap-1.5 transition-colors hover:text-slate-600"
                        >
                          <MessageCircle className="size-4" />
                          <span className="text-xs font-bold">{post.comments.length}</span>
                        </Link>
>>>>>>> Stashed changes
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default DiscussionBoard;
