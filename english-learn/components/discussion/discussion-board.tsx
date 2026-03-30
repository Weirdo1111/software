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
  selectedTag: DiscussionCategory | "all";
  view: ViewMode;
  search: string;
  roleplayHref: string;
  onOpenComposer: () => void;
  onToggleLike?: (postId: string) => void;
  onSearchChange: (value: string) => void;
  onSelectTag: (value: DiscussionCategory | "all") => void;
  onSelectView: (value: ViewMode) => void;
}

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
    reading: ScrollText,
    writing: SquarePen,
    speaking: Mic,
    experience: TrendingUp,
    assessment: Pin,
  };

  return iconMap[tag];
}

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  return trimmed.charAt(0).toUpperCase();
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

export function DiscussionBoard({
  locale,
  posts,
  notifications,
  selectedTag,
  view,
  search,
  roleplayHref,
  onOpenComposer,
  onSearchChange,
  onSelectTag,
  onSelectView,
}: DiscussionBoardProps) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  const text = {
    zh: {
      sideTitle: "论坛分类",
      heroTitle: "学习讨论论坛",
      start: "Start New Discussion",
      search: "Search discussion topics...",
      all: "全部",
      latest: "最新",
      popular: "热门",
      pinned: "置顶",
<<<<<<< Updated upstream
      empty: "当前没有可展示的讨论主题。",
      activity: "消息中心",
      replies: "回复",
      likes: "点赞",
      views: "浏览",
      forumCn: "学术论坛",
=======
      empty: "当前暂无讨论内容。",
      forumCn: "LEARN ENGLISH RIGHT",
      roleplay: "Roleplay",
      queryAll: "Explore the latest community updates",
      querySearch: "Results are now driven by the live forum query.",
>>>>>>> Stashed changes
    },
    en: {
      sideTitle: "Forum Categories",
      heroTitle: "Academic Discussion Forum",
      start: "Start New Discussion",
      search: "Search discussion topics...",
      all: "All",
      latest: "Latest",
      popular: "Popular",
      pinned: "Pinned",
<<<<<<< Updated upstream
      empty: "No discussion threads available.",
      activity: "Activity",
      replies: "Replies",
      likes: "Likes",
      views: "Views",
      forumCn: "Academic Forum",
=======
      empty: "No discussions found.",
      forumCn: "LEARN ENGLISH RIGHT",
      roleplay: "Roleplay",
      queryAll: "Explore the latest community updates",
      querySearch: "Results are now driven by the live forum query.",
>>>>>>> Stashed changes
    },
  }[locale];

  const categories: DiscussionCategory[] = [
    "grammar",
    "listening",
    "reading",
    "writing",
    "speaking",
    "experience",
    "assessment",
  ];

<<<<<<< Updated upstream
  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let list = [...posts];

    if (keyword) {
      list = list.filter((post) => {
        const haystack = [post.title, post.content, post.author, post.excerpt ?? ""]
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      });
    }

    if (selectedTag !== "all") {
      list = list.filter((post) => post.tag === selectedTag);
    }

    if (view === "latest") {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return list;
    }

    if (view === "popular") {
      list.sort(
        (a, b) =>
          b.comments.length * 2 + b.views + b.likes * 3 -
          (a.comments.length * 2 + a.views + a.likes * 3),
      );
      return list;
    }

    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  }, [posts, search, selectedTag, view]);

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
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9aa4b2]"
=======
  const querySubtitle = search.trim()
    ? `${text.querySearch} "${search.trim()}"`
    : selectedTag === "all"
      ? text.queryAll
      : `Browsing ${getCategoryLabel(selectedTag, locale)}`;

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {text.forumCn}
            </span>
          </div>

          <div className="hidden max-w-md flex-1 lg:block">
            <div className="relative flex items-center rounded-xl bg-slate-200/50 px-4 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
              <Search className="size-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
>>>>>>> Stashed changes
                placeholder={text.search}
              />
            </div>
          </div>

          <div className="flex min-w-[220px] items-center justify-end gap-3">
            <Link
<<<<<<< Updated upstream
              href="/activity"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e3eaf4] bg-white text-[#1f2937] shadow-sm transition hover:bg-[#f8fbff]"
=======
              href={`/activity?lang=${locale}`}
              className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-200/50"
>>>>>>> Stashed changes
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
<<<<<<< Updated upstream

=======
            <Link
              href={roleplayHref}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            >
              <Bot className="size-4" />
              {text.roleplay}
            </Link>
>>>>>>> Stashed changes
            <button
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
              onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => setSelectedTag("all")}
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
                  onClick={() => setSelectedTag(category)}
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
                  onClick={() => onSelectTag("all")}
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
                <h1 className="text-[36px] font-medium leading-none tracking-[-0.03em] text-[#1f2937] md:text-[42px]">
                  {text.heroTitle}
                </h1>
=======
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <button
                      key={category}
                      onClick={() => onSelectTag(category)}
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
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                  {text.heroTitle}
                </h1>
                <p className="mt-2 text-slate-500">{querySubtitle}</p>
>>>>>>> Stashed changes
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {(["all", "latest", "popular"] as ViewMode[]).map((item) => (
                  <button
                    key={item}
<<<<<<< Updated upstream
                    onClick={() => setView(item)}
                    className={`rounded-full border px-6 py-2.5 text-sm font-medium transition ${
=======
                    onClick={() => onSelectView(item)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
>>>>>>> Stashed changes
                      view === item
                        ? "border-[#2f6df6] bg-[#eef4ff] text-[#2f6df6]"
                        : "border-[#d6deea] bg-white text-[#4b5563] hover:bg-[#f8fbff]"
                    }`}
                  >
                    {item === "all"
                      ? text.all
                      : item === "latest"
                        ? text.latest
                        : text.popular}
                  </button>
                ))}
              </div>
            </div>
          </section>

<<<<<<< Updated upstream
          <section>
            {filteredPosts.length === 0 ? (
              <div className="bg-white px-6 py-10 text-sm text-[#4b5563] shadow-sm">
                {text.empty}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="group flex min-h-[300px] flex-col border border-[#edf1f6] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
=======
            {posts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                <p>{text.empty}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}?lang=${locale}`}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
>>>>>>> Stashed changes
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="inline-flex rounded-full bg-[#edf2f8] px-3 py-1 text-[11px] font-semibold text-[#5b6574]">
                        {getCategoryLabel(post.tag, locale)}
                      </span>

                      {post.pinned ? (
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f6e8c7] text-[#8a6a2f]">
                          <Pin className="size-4" />
                        </span>
<<<<<<< Updated upstream
                      ) : (
                        <span className="h-9 w-9" />
                      )}
                    </div>

                    <h3 className="line-clamp-4 text-[24px] font-medium leading-[1.35] tracking-[-0.02em] text-[#111827] transition-colors group-hover:text-[#2f6df6]">
                      {post.title}
                    </h3>

                    <div className="mt-4 text-sm leading-6 text-[#8a94a6]">
                      {getLastActivityText(post, locale)}
                    </div>

                    <div className="mt-auto pt-10">
                      <div className="flex items-end justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f6df6] text-sm font-bold text-white">
                            {getInitial(post.author)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-[#1f2937]">
                              {post.author}
                            </div>
                          </div>
=======
                        {post.pinned ? <Pin className="size-3 fill-amber-500 text-amber-500" /> : null}
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
                        <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                          {getInitial(post.author)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{post.author}</span>
                          <span className="text-[11px] text-slate-400">{getLastActivityText(post, locale)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-slate-400">
                        <div className={`flex items-center gap-1.5 ${post.liked ? "text-rose-500" : ""}`}>
                          <Heart className={`size-4 ${post.liked ? "fill-current" : ""}`} />
                          <span className="text-xs font-bold">{post.likes}</span>
>>>>>>> Stashed changes
                        </div>

                        <div className="flex shrink-0 items-center gap-5 text-sm text-[#6b7280]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
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
                        </div>
                      </div>
                    </div>
                  </Link>
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
