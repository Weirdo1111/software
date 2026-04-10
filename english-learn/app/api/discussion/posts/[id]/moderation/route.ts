import { NextRequest, NextResponse } from "next/server";

import { isManagerCurrentUser, requireCurrentDiscussionUser } from "@/lib/current-user";
import { toStoredDiscussionModerationStatus } from "@/lib/discussion-moderation";
import { prisma } from "@/lib/prisma";
import { toDiscussionPost } from "@/lib/discussion-mappers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireCurrentDiscussionUser();

    if (!isManagerCurrentUser(currentUser)) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const body = await req.json();
    const decision =
      typeof body.decision === "string" ? body.decision.trim().toLowerCase() : "";

    if (decision !== "approve" && decision !== "reject") {
      return NextResponse.json({ error: "Invalid moderation decision" }, { status: 400 });
    }

    const { id } = await params;
    const postId = BigInt(id);

    const existing = await prisma.discussionPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updated = await prisma.discussionPost.update({
      where: { id: postId },
      data: {
        moderationStatus: toStoredDiscussionModerationStatus(
          decision === "approve" ? "approved" : "rejected",
        ),
      },
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

    return NextResponse.json(
      toDiscussionPost(updated, currentUser.id, { canModerate: true }),
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    }

    console.error("discussion moderation POST failed", error);
    return NextResponse.json({ error: "Failed to update moderation status" }, { status: 500 });
  }
}
