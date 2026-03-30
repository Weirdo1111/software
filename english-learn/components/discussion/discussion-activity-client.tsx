"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, FileText, Heart, MessageCircle, MessageSquareText } from "lucide-react";

import type {
  DiscussionComment,
  DiscussionNotification,
  DiscussionPost,
  Locale,
} from "@/components/discussion/types";

type MyCommentItem = {
  postId: string;
  postTitle: string;
  comment: DiscussionComment;
};

async function readJsonOrFallback<T>(response: Response, fallback: T): Promise<T> {
  if (!response.ok) return fallback;

  const text = await response.text();
  if (!text.trim()) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
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

export function DiscussionActivityClient({ locale }: { locale: Locale }) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<DiscussionNotification[]>([]);
  const [myPosts, setMyPosts] = useState<DiscussionPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<DiscussionPost[]>([]);
  const [commentedPosts, setCommentedPosts] = useState<DiscussionPost[]>([]);
  const [myComments, setMyComments] = useState<MyCommentItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/discussion/activity", { cache: "no-store" });
        const json = await readJsonOrFallback<{
          notifications?: DiscussionNotification[];
          myPosts?: DiscussionPost[];
          likedPosts?: DiscussionPost[];
          commentedPosts?: DiscussionPost[];
          myComments?: MyCommentItem[];
        }>(res, {});

        setNotifications(json.notifications ?? []);
        setMyPosts(json.myPosts ?? []);
        setLikedPosts(json.likedPosts ?? []);
        setCommentedPosts(json.commentedPosts ?? []);
        setMyComments(json.myComments ?? []);

        await fetch("/api/discussion/activity/read", { method: "POST" });
      } catch {
        setNotifications([]);
        setMyPosts([]);
        setLikedPosts([]);
        setCommentedPosts([]);
        setMyComments([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const text = {
    zh: {
      title: "消息中心",
      subtitle: "查看帖子互动、点赞记录、评论记录与我的帖子。",
      notifications: "最新通知",
      myPosts: "我发出的帖子",
      likedPosts: "我点过赞的帖子",
      commentedPosts: "我评论过的帖子",
      myComments: "我的评论",
      noNotifications: "当前还没有新的互动通知。",
      noPosts: "你还没有发布帖子。",
      noLikedPosts: "你还没有点赞任何帖子。",
      noCommentedPosts: "你还没有评论任何帖子。",
      noComments: "你还没有发表任何评论。",
      back: "返回论坛",
      likes: "点赞",
      comments: "评论",
      views: "浏览",
      openThread: "查看帖子",
      commentOn: "评论于",
    },
    en: {
      title: "Activity Center",
      subtitle: "Track engagement, liked posts, commented posts, and your own comments.",
      notifications: "Recent Notifications",
      myPosts: "My Posts",
      likedPosts: "Liked Posts",
      commentedPosts: "Commented Posts",
      myComments: "My Comments",
      noNotifications: "No notifications yet.",
      noPosts: "You have not published any posts yet.",
      noLikedPosts: "You have not liked any posts yet.",
      noCommentedPosts: "You have not commented on any posts yet.",
      noComments: "You have not written any comments yet.",
      back: "Back to Forum",
      likes: "likes",
      comments: "comments",
      views: "views",
      openThread: "Open thread",
      commentOn: "Commented on",
    },
  }[locale];

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="border-b border-[#dde2f3] bg-[#f9f9ff] px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#030813]">{text.title}</h1>
            <p className="mt-2 text-sm text-[#45474C]">{text.subtitle}</p>
          </div>

          <Link
            href={`/discussion?lang=${locale}`}
            className="border border-[#dde2f3] bg-white px-4 py-2 text-sm font-medium text-[#030813]"
          >
            {text.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-8 py-10">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-[#030813]" />
              <h2 className="font-serif text-2xl text-[#030813]">
                {text.notifications}
              </h2>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white px-6 py-8 text-sm text-[#45474C] shadow-sm">
                {text.noNotifications}
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={`/posts/${item.postId}?lang=${locale}`}
                  className={`block border-l-4 bg-white px-5 py-5 shadow-sm transition hover:bg-[#eef2ff] ${
                    item.type === "like" ? "border-[#d64545]" : "border-[#3f6ad8]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.type === "like" ? (
                        <Heart className="size-4 text-[#d64545]" />
                      ) : (
                        <MessageCircle className="size-4 text-[#3f6ad8]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm leading-7 text-[#2a303d]">
                        <span className="font-semibold text-[#030813]">
                          {item.actor}
                        </span>{" "}
                        {item.type === "like"
                          ? locale === "zh"
                            ? "点赞了你的帖子"
                            : "liked your post"
                          : locale === "zh"
                          ? "评论了你的帖子"
                          : "commented on your post"}{" "}
                        <span className="font-semibold text-[#675E43]">
                          “{item.postTitle}”
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-[#45474C]">
                        {formatRelativeDate(item.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-[#030813]" />
              <h2 className="font-serif text-2xl text-[#030813]">
                {text.myPosts}
              </h2>
            </div>

            {myPosts.length === 0 ? (
              <div className="bg-white px-6 py-8 text-sm text-[#45474C] shadow-sm">
                {text.noPosts}
              </div>
            ) : (
              myPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}?lang=${locale}`}
                  className="block bg-white px-5 py-5 shadow-sm transition hover:bg-[#eef2ff]"
                >
                  <h3 className="font-serif text-xl text-[#030813]">{post.title}</h3>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide text-[#45474C]">
                    <span>{post.tag}</span>
                    <span>{post.likes} {text.likes}</span>
                    <span>{post.comments.length} {text.comments}</span>
                    <span>{post.views} {text.views}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-[#d64545]" />
              <h2 className="font-serif text-2xl text-[#030813]">
                {text.likedPosts}
              </h2>
            </div>

            {likedPosts.length === 0 ? (
              <div className="bg-white px-6 py-8 text-sm text-[#45474C] shadow-sm">
                {text.noLikedPosts}
              </div>
            ) : (
              likedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}?lang=${locale}`}
                  className="block bg-white px-5 py-5 shadow-sm transition hover:bg-[#eef2ff]"
                >
                  <h3 className="font-serif text-xl text-[#030813]">{post.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide text-[#45474C]">
                    <span>{post.tag}</span>
                    <span>{post.likes} {text.likes}</span>
                    <span>{post.comments.length} {text.comments}</span>
                    <span>{post.views} {text.views}</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-[#3f6ad8]" />
              <h2 className="font-serif text-2xl text-[#030813]">
                {text.commentedPosts}
              </h2>
            </div>

            {commentedPosts.length === 0 ? (
              <div className="bg-white px-6 py-8 text-sm text-[#45474C] shadow-sm">
                {text.noCommentedPosts}
              </div>
            ) : (
              commentedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}?lang=${locale}`}
                  className="block bg-white px-5 py-5 shadow-sm transition hover:bg-[#eef2ff]"
                >
                  <h3 className="font-serif text-xl text-[#030813]">{post.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide text-[#45474C]">
                    <span>{post.tag}</span>
                    <span>{post.likes} {text.likes}</span>
                    <span>{post.comments.length} {text.comments}</span>
                    <span>{post.views} {text.views}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-[#030813]" />
            <h2 className="font-serif text-2xl text-[#030813]">
              {text.myComments}
            </h2>
          </div>

          {myComments.length === 0 ? (
            <div className="bg-white px-6 py-8 text-sm text-[#45474C] shadow-sm">
              {text.noComments}
            </div>
          ) : (
            myComments.map((item, index) => (
              <div key={`${item.postId}-${item.comment.id}-${index}`} className="bg-white px-5 py-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-[#675E43]">
                      {text.commentOn}
                    </div>
                    <Link
                      href={`/posts/${item.postId}?lang=${locale}`}
                      className="mt-1 block font-serif text-xl text-[#030813] hover:text-[#675E43]"
                    >
                      {item.postTitle}
                    </Link>
                  </div>

                  <Link
                    href={`/posts/${item.postId}`}
                    className="text-sm font-medium text-[#3f6ad8]"
                  >
                    {text.openThread}
                  </Link>
                </div>

                <div className="mt-4 border-l-2 border-[#dde2f3] pl-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-[#2a303d]">
                    {item.comment.content ||
                      (item.comment.audioDataUrl
                        ? locale === "zh"
                          ? "[语音评论]"
                          : "[Voice comment]"
                        : "")}
                  </p>
                  <p className="mt-2 text-xs text-[#45474C]">
                    {formatRelativeDate(item.comment.createdAt, locale)}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default DiscussionActivityClient;
