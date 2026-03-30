import type {
  DiscussionComment,
  DiscussionNotification,
  DiscussionPost,
} from "@/components/discussion/types";
import { normalizeDiscussionCategory } from "@/components/discussion/types";

type DiscussionLikeRecord = {
  userId: bigint;
};

type DiscussionCommentRecord = {
  id: bigint | number | string;
  content: string;
  audioData?: string | null;
  audioMimeType?: string | null;
  audioDurationSec?: number | null;
  createdAt: Date | string;
  author: {
    displayName: string;
  };
};

type DiscussionPostRecord = {
  id: bigint | number | string;
  title: string;
  content: string;
  excerpt?: string | null;
  category: string;
  likesCount: number;
  pinned: boolean;
  createdAt: Date | string;
  viewsCount: number;
  author: {
    displayName: string;
  };
  likes?: DiscussionLikeRecord[];
  comments?: DiscussionCommentRecord[];
};

type DiscussionNotificationRecord = {
  id: bigint | number | string;
  type: string;
  createdAt: Date | string;
  isRead: boolean;
  actor?: {
    displayName: string;
  } | null;
  post?: {
    id: bigint | number | string;
    title: string;
  } | null;
};

export function serializeId(id: bigint | number | string) {
  return id.toString();
}

export function toDiscussionPost(post: DiscussionPostRecord, currentUserId: bigint): DiscussionPost {
  return {
    id: serializeId(post.id),
    title: post.title,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    author: post.author.displayName,
    tag: normalizeDiscussionCategory(post.category),
    likes: post.likesCount,
    liked: post.likes?.some((like) => like.userId === currentUserId) ?? false,
    pinned: post.pinned,
    createdAt: new Date(post.createdAt).toISOString().slice(0, 16).replace("T", " "),
    comments:
      post.comments?.map(
        (comment): DiscussionComment => ({
          id: serializeId(comment.id),
          author: comment.author.displayName,
          content: comment.content,
          audioDataUrl: comment.audioData ?? undefined,
          audioMimeType: comment.audioMimeType ?? undefined,
          audioDurationSec: comment.audioDurationSec ?? undefined,
          createdAt: new Date(comment.createdAt)
            .toISOString()
            .slice(0, 16)
            .replace("T", " "),
          role: undefined,
        }),
      ) ?? [],
    views: post.viewsCount,
  };
}

export function toDiscussionNotification(item: DiscussionNotificationRecord): DiscussionNotification {
  return {
    id: serializeId(item.id),
    type: item.type === "like" ? "like" : "comment",
    actor: item.actor?.displayName ?? "Someone",
    postId: item.post ? serializeId(item.post.id) : "",
    postTitle: item.post?.title ?? "",
    createdAt: new Date(item.createdAt).toISOString().slice(0, 16).replace("T", " "),
    read: item.isRead,
  };
}
