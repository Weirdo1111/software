import type {
  DiscussionComment,
  DiscussionNotification,
  DiscussionPost,
} from "@/components/discussion/types";

export function serializeId(id: bigint | number | string) {
  return id.toString();
}

export function toDiscussionPost(post: any, currentUserId: bigint): DiscussionPost {
  return {
    id: serializeId(post.id),
    title: post.title,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    author: post.author.displayName,
    tag: post.category,
    likes: post.likesCount,
    liked: post.likes?.some((like: any) => like.userId === currentUserId) ?? false,
    pinned: post.pinned,
    createdAt: new Date(post.createdAt).toISOString().slice(0, 16).replace("T", " "),
    comments:
      post.comments?.map(
        (comment: any): DiscussionComment => ({
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
        })
      ) ?? [],
    views: post.viewsCount,
  };
}

export function toDiscussionNotification(item: any): DiscussionNotification {
  return {
    id: serializeId(item.id),
    type: item.type,
    actor: item.actor?.displayName ?? "Someone",
    postId: item.post ? serializeId(item.post.id) : "",
    postTitle: item.post?.title ?? "",
    createdAt: new Date(item.createdAt).toISOString().slice(0, 16).replace("T", " "),
    read: item.isRead,
  };
}
