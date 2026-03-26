import { NextRequest, NextResponse } from "next/server";
import { requireCurrentDiscussionUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireCurrentDiscussionUser();
    const { id } = await params;
    const postId = BigInt(id);

    const existing = await prisma.discussionPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
    });

    const post = await prisma.discussionPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing) {
      await prisma.discussionPostLike.delete({
        where: {
          postId_userId: {
            postId,
            userId: currentUser.id,
          },
        },
      });

      const updated = await prisma.discussionPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({
        liked: false,
        likes: updated.likesCount,
      });
    }

    await prisma.discussionPostLike.create({
      data: {
        postId,
        userId: currentUser.id,
      },
    });

    const updated = await prisma.discussionPost.update({
      where: { id: postId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    if (post.authorId !== currentUser.id) {
      await prisma.discussionNotification.create({
        data: {
          userId: post.authorId,
          actorId: currentUser.id,
          postId,
          type: "like",
        },
      });
    }

    return NextResponse.json({
      liked: true,
      likes: updated.likesCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    }

    console.error("discussion like POST failed", error);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
