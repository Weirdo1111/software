import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import {
  getCurrentAuthIdentity,
  requireCurrentDiscussionUser,
} from "@/lib/current-user";
import { toStoredDiscussionModerationStatus } from "@/lib/discussion-moderation";
import { prisma } from "@/lib/prisma";
import { toDiscussionPost } from "@/lib/discussion-mappers";

function getDiscussionPostCreateErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to create post";
  }

  if (
    error.message.includes("Unknown argument `audioData`") ||
    error.message.includes("Unknown argument `audioMimeType`") ||
    error.message.includes("Unknown argument `audioDurationSec`")
  ) {
    return "Server Prisma Client is outdated. Run `npm run prisma:generate`, then rebuild and restart the server.";
  }

  if (
    error.message.includes("Unknown column") &&
    (error.message.includes("audioData") ||
      error.message.includes("audioMimeType") ||
      error.message.includes("audioDurationSec"))
  ) {
    return "Server database is missing discussion voice-post columns. Run `npm run prisma:deploy`, then rebuild and restart the server.";
  }

  return `Failed to create post: ${error.message}`;
}

export async function GET(req: NextRequest) {
  try {
    const currentIdentity = await getCurrentAuthIdentity();
    const currentUser = currentIdentity ? await requireCurrentDiscussionUser() : null;
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const view = searchParams.get("view");
    const search = searchParams.get("search");

    const where: Prisma.DiscussionPostWhereInput = {
      moderationStatus: "APPROVED",
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
        { author: { is: { displayName: { contains: search } } } },
      ];
    }

    let orderBy: Prisma.DiscussionPostOrderByWithRelationInput[] = [
      { pinned: "desc" },
      { createdAt: "desc" },
    ];

    if (view === "latest") {
      orderBy = [{ createdAt: "desc" }];
    }

    if (view === "popular") {
      orderBy = [{ likesCount: "desc" }, { commentsCount: "desc" }, { viewsCount: "desc" }];
    }

    const posts = await prisma.discussionPost.findMany({
      where,
      orderBy,
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

    return NextResponse.json(
      posts.map((post) => toDiscussionPost(post, currentUser?.id ?? BigInt(-1)))
    );
  } catch (error) {
    console.error("discussion posts GET failed", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireCurrentDiscussionUser();
    const body = await req.json();
    const { title, content, category } = body;
    const audioDataUrl =
      typeof body.audioDataUrl === "string" ? body.audioDataUrl.trim() : "";
    const audioMimeType =
      typeof body.audioMimeType === "string" ? body.audioMimeType.trim() : "";
    const audioDurationSec =
      typeof body.audioDurationSec === "number" && Number.isFinite(body.audioDurationSec)
        ? Math.max(1, Math.round(body.audioDurationSec))
        : null;

    if (!title?.trim() || !category?.trim() || (!content?.trim() && !audioDataUrl)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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

    const trimmedContent = typeof content === "string" ? content.trim() : "";
    const created = await prisma.discussionPost.create({
      data: {
        authorId: currentUser.id,
        title: title.trim(),
        content: trimmedContent,
        excerpt: trimmedContent
          ? trimmedContent.length > 140
            ? `${trimmedContent.slice(0, 140)}...`
            : trimmedContent
          : "Voice post",
        audioData: audioDataUrl || null,
        audioMimeType: audioMimeType || null,
        audioDurationSec,
        category: category.trim(),
        moderationStatus: toStoredDiscussionModerationStatus("pending"),
        pinned: false,
        viewsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        lastActivityType: "posted",
        lastActivityUserId: currentUser.id,
        lastActivityAt: new Date(),
      },
      include: {
        author: true,
        comments: {
          include: { author: true },
        },
        likes: {
          where: {
            userId: currentUser.id,
          },
        },
      },
    });

    return NextResponse.json(toDiscussionPost(created, currentUser.id));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured. Create .env.local first." },
        { status: 500 }
      );
    }

    console.error("discussion posts POST failed", error);
    return NextResponse.json({ error: getDiscussionPostCreateErrorMessage(error) }, { status: 500 });
  }
}
