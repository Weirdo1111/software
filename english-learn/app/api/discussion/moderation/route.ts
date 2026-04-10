import { NextResponse } from "next/server";

import { isManagerCurrentUser, requireCurrentDiscussionUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toDiscussionPost } from "@/lib/discussion-mappers";

export async function GET() {
  try {
    const currentUser = await requireCurrentDiscussionUser();

    if (!isManagerCurrentUser(currentUser)) {
      return NextResponse.json({ error: "Manager access required", posts: [] }, { status: 403 });
    }

    const posts = await prisma.discussionPost.findMany({
      where: {
        moderationStatus: "PENDING",
      },
      orderBy: [{ createdAt: "asc" }],
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
            userId: currentUser.id,
          },
        },
      },
    });

    return NextResponse.json({
      posts: posts.map((post) => toDiscussionPost(post, currentUser.id, { canModerate: true })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return NextResponse.json({ error: "Please sign in first", posts: [] }, { status: 401 });
    }

    console.error("discussion moderation GET failed", error);
    return NextResponse.json({ error: "Failed to load moderation queue", posts: [] }, { status: 500 });
  }
}
