import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentAuthIdentity,
  requireCurrentDiscussionUser,
} from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toDiscussionPost } from "@/lib/discussion-mappers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentIdentity = await getCurrentAuthIdentity();
    const currentUser = currentIdentity ? await requireCurrentDiscussionUser() : null;
    const { id } = await params;
    const postId = BigInt(id);

    await prisma.discussionPost.update({
      where: { id: postId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });

    const post = await prisma.discussionPost.findUnique({
      where: { id: postId },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          where: {
            userId: currentUser?.id ?? BigInt(-1),
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(toDiscussionPost(post, currentUser?.id ?? BigInt(-1)));
  } catch (error) {
    console.error("discussion post detail GET failed", error);
    return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
  }
}
