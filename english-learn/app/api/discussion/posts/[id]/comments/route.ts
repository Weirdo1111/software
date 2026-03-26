import { NextRequest, NextResponse } from "next/server";
import { requireCurrentDiscussionUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireCurrentDiscussionUser();
    const { id } = await params;
    const postId = BigInt(id);
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const audioDataUrl =
      typeof body.audioDataUrl === "string" ? body.audioDataUrl.trim() : "";
    const audioMimeType =
      typeof body.audioMimeType === "string" ? body.audioMimeType.trim() : "";
    const audioDurationSec =
      typeof body.audioDurationSec === "number" && Number.isFinite(body.audioDurationSec)
        ? Math.max(1, Math.round(body.audioDurationSec))
        : null;

    if (!content && !audioDataUrl) {
      return NextResponse.json(
        { error: "Text or voice content is required" },
        { status: 400 }
      );
    }

    if (audioDataUrl && !audioDataUrl.startsWith("data:audio/")) {
      return NextResponse.json({ error: "Invalid voice payload" }, { status: 400 });
    }

    if (audioDataUrl.length > 3_000_000) {
      return NextResponse.json(
        { error: "Voice message is too large. Keep it under about 60 seconds." },
        { status: 400 }
      );
    }

    const post = await prisma.discussionPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.discussionComment.create({
      data: {
        postId,
        authorId: currentUser.id,
        content,
        audioData: audioDataUrl || null,
        audioMimeType: audioMimeType || null,
        audioDurationSec,
      },
      include: {
        author: true,
      },
    });

    await prisma.discussionPost.update({
      where: { id: postId },
      data: {
        commentsCount: {
          increment: 1,
        },
        lastActivityType: "replied",
        lastActivityUserId: currentUser.id,
        lastActivityAt: new Date(),
      },
    });

    if (post.authorId !== currentUser.id) {
      await prisma.discussionNotification.create({
        data: {
          userId: post.authorId,
          actorId: currentUser.id,
          postId,
          commentId: comment.id,
          type: "comment",
        },
      });
    }

    return NextResponse.json({
      id: comment.id.toString(),
      author: comment.author.displayName,
      content: comment.content,
      audioDataUrl: comment.audioData,
      audioMimeType: comment.audioMimeType,
      audioDurationSec: comment.audioDurationSec,
      createdAt: comment.createdAt.toISOString().slice(0, 16).replace("T", " "),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    }

    console.error("discussion comment POST failed", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
