import { NextResponse } from "next/server";
import { requireCurrentDiscussionUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  toDiscussionNotification,
  toDiscussionPost,
} from "@/lib/discussion-mappers";

export async function GET() {
  try {
    const currentUser = await requireCurrentDiscussionUser();

    const [notifications, myPosts, likedPostsRaw, commentedPostsRaw, myCommentsRaw] =
      await Promise.all([
        prisma.discussionNotification.findMany({
          where: { userId: currentUser.id },
          include: {
            actor: true,
            post: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.discussionPost.findMany({
          where: { authorId: currentUser.id },
          include: {
            author: true,
            comments: {
              include: { author: true },
              orderBy: { createdAt: "asc" },
            },
            likes: {
              where: { userId: currentUser.id },
            },
          },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        }),
        prisma.discussionPost.findMany({
          where: {
            likes: {
              some: { userId: currentUser.id },
            },
          },
          include: {
            author: true,
            comments: {
              include: { author: true },
              orderBy: { createdAt: "asc" },
            },
            likes: {
              where: { userId: currentUser.id },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.discussionPost.findMany({
          where: {
            comments: {
              some: { authorId: currentUser.id },
            },
          },
          include: {
            author: true,
            comments: {
              include: { author: true },
              orderBy: { createdAt: "asc" },
            },
            likes: {
              where: { userId: currentUser.id },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.discussionComment.findMany({
          where: { authorId: currentUser.id },
          include: {
            post: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    return NextResponse.json({
      notifications: notifications.map(toDiscussionNotification),
      myPosts: myPosts.map((post) => toDiscussionPost(post, currentUser.id)),
      likedPosts: likedPostsRaw.map((post) => toDiscussionPost(post, currentUser.id)),
      commentedPosts: commentedPostsRaw.map((post) => toDiscussionPost(post, currentUser.id)),
      myComments: myCommentsRaw.map((comment) => ({
        postId: comment.postId.toString(),
        postTitle: comment.post?.title ?? "",
        comment: {
          id: comment.id.toString(),
          author: currentUser.displayName,
          content: comment.content,
          audioDataUrl: comment.audioData ?? undefined,
          audioMimeType: comment.audioMimeType ?? undefined,
          audioDurationSec: comment.audioDurationSec ?? undefined,
          createdAt: comment.createdAt.toISOString().slice(0, 16).replace("T", " "),
        },
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return NextResponse.json({
        notifications: [],
        myPosts: [],
        likedPosts: [],
        commentedPosts: [],
        myComments: [],
      });
    }

    console.error("discussion activity GET failed", error);
    return NextResponse.json(
      {
        notifications: [],
        myPosts: [],
        likedPosts: [],
        commentedPosts: [],
        myComments: [],
      },
      { status: 500 }
    );
  }
}
