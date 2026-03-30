import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import {
  getCurrentAuthIdentity,
  requireCurrentDiscussionUser,
} from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { toDiscussionPost } from "@/lib/discussion-mappers";

export async function GET(req: NextRequest) {
  try {
    const currentIdentity = await getCurrentAuthIdentity();
    const currentUser = currentIdentity ? await requireCurrentDiscussionUser() : null;
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const view = searchParams.get("view");
    const search = searchParams.get("search");

    const where: Prisma.DiscussionPostWhereInput = {};

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

    if (!title?.trim() || !content?.trim() || !category?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const created = await prisma.discussionPost.create({
      data: {
        authorId: currentUser.id,
        title: title.trim(),
        content: content.trim(),
        excerpt:
          content.trim().length > 140 ? `${content.trim().slice(0, 140)}...` : content.trim(),
        category: category.trim(),
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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Failed to create post: ${error.message}`
            : "Failed to create post",
      },
      { status: 500 }
    );
  }
}
