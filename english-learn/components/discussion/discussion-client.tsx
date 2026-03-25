"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Plus, Send, X } from "lucide-react";

import { DiscussionBoard } from "@/components/discussion/discussion-board";
import type {
  DiscussionComment,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";
import {
  getDiscussionPostsServerSnapshot,
  getDiscussionPostsSnapshot,
  parseDiscussionPosts,
  subscribeDiscussionPosts,
  writeDiscussionPosts,
} from "@/lib/discussion-store";

export function DiscussionClient({ locale }: { locale: Locale }) {
  const [openComposer, setOpenComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(
    locale === "zh" ? "学习讨论" : "Discussion"
  );

  const postsRaw = useSyncExternalStore(
    subscribeDiscussionPosts,
    getDiscussionPostsSnapshot,
    getDiscussionPostsServerSnapshot
  );

  const posts = useMemo<DiscussionPost[]>(() => {
    return parseDiscussionPosts(postsRaw);
  }, [postsRaw]);

  const copy = useMemo(
    () => ({
      postTitle: locale === "zh" ? "发布帖子" : "Create a Post",
      postSubtitle:
        locale === "zh"
          ? "写下你的问题、经验或学习反馈。"
          : "Share your question, experience, or learning feedback.",
      inputTitle: locale === "zh" ? "帖子标题" : "Post Title",
      inputContent: locale === "zh" ? "帖子内容" : "Post Content",
      inputCategory: locale === "zh" ? "帖子分类" : "Category",
      titlePlaceholder:
        locale === "zh" ? "请输入一个清晰的标题" : "Write a clear title",
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

    writeDiscussionPosts([newPost, ...posts]);

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

    writeDiscussionPosts(nextPosts);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const newComment: DiscussionComment = {
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

    writeDiscussionPosts(nextPosts);
  };

  return (
    <>
      <DiscussionBoard
        locale={locale}
        posts={posts}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onOpenComposer={() => setOpenComposer(true)}
      />

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
    </>
  );
}

export default DiscussionClient;
