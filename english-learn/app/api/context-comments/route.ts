import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const contextSchema = z.object({
  module: z.enum(["listening", "speaking", "reading", "writing"]),
  targetId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  plazaTag: z.string().min(1),
});

const commentSchema = z.object({
  id: z.string().uuid(),
  author: z.string().min(1),
  content: z.string().min(1),
  createdAt: z.string(),
  topic: z.string().optional(),
  anchorLabel: z.string().optional(),
  anchorText: z.string().optional(),
  promotedAt: z.string().optional(),
});

const addCommentSchema = z.object({
  context: contextSchema,
  comment: commentSchema,
});

const toggleLikeSchema = z.object({
  commentId: z.string().uuid(),
});

const promoteCommentSchema = z.object({
  commentId: z.string().uuid(),
  promotedAt: z.string().min(1),
});

function mapThreadResponse(input: {
  context: z.infer<typeof contextSchema>;
  updatedAt: Date;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    topic: string | null;
    likesCount: number;
    anchorLabel: string | null;
    anchorText: string | null;
    promotedAt: Date | null;
    liked: boolean;
  }>;
}) {
  return {
    id: `${input.context.module}:${input.context.targetId}`,
    module: input.context.module,
    targetId: input.context.targetId,
    title: input.context.title,
    subtitle: input.context.subtitle,
    updatedAt: input.updatedAt.toISOString(),
    comments: input.comments.map((comment) => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      topic: comment.topic ?? undefined,
      likes: comment.likesCount,
      liked: comment.liked,
      anchorLabel: comment.anchorLabel ?? undefined,
      anchorText: comment.anchorText ?? undefined,
      promotedAt: comment.promotedAt?.toISOString() ?? undefined,
    })),
  };
}

async function loadThread(
  userId: bigint,
  module: string,
  targetId: string,
  fallbackContext?: z.infer<typeof contextSchema>,
) {
  const thread = await prisma.contextCommentThread.findUnique({
    where: {
      module_targetId: {
        module,
        targetId,
      },
    },
    include: {
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          likes: {
            where: { userId },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!thread) return null;

  const context =
    fallbackContext ??
    ({
      module: thread.module as z.infer<typeof contextSchema>["module"],
      targetId: thread.targetId,
      title: thread.title,
      subtitle: thread.subtitle ?? undefined,
      plazaTag: thread.plazaTag,
    } satisfies z.infer<typeof contextSchema>);

  return mapThreadResponse({
    context,
    updatedAt: thread.updatedAt,
    comments: thread.comments.map((item) => ({
      id: item.id,
      author: item.author,
      content: item.content,
      createdAt: item.createdAt,
      topic: item.topic,
      likesCount: item.likesCount,
      anchorLabel: item.anchorLabel,
      anchorText: item.anchorText,
      promotedAt: item.promotedAt,
      liked: item.likes.length > 0,
    })),
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = contextSchema.safeParse({
    module: url.searchParams.get("module"),
    targetId: url.searchParams.get("targetId"),
    title: url.searchParams.get("title") ?? "Context",
    subtitle: url.searchParams.get("subtitle") ?? undefined,
    plazaTag: url.searchParams.get("plazaTag") ?? "Discussion",
  });

  if (!query.success) {
    return jsonError(query.error.issues[0]?.message ?? "Invalid query", 422);
  }

  const userId = await resolveRequestUserId(request);
  const thread = await loadThread(userId, query.data.module, query.data.targetId, query.data);
  return NextResponse.json({ thread });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = addCommentSchema.parse(body);
    const userId = await resolveRequestUserId(request);

    const thread = await prisma.contextCommentThread.upsert({
      where: {
        module_targetId: {
          module: payload.context.module,
          targetId: payload.context.targetId,
        },
      },
      update: {
        title: payload.context.title,
        subtitle: payload.context.subtitle,
        plazaTag: payload.context.plazaTag,
        updatedAt: new Date(payload.comment.createdAt),
      },
      create: {
        module: payload.context.module,
        targetId: payload.context.targetId,
        title: payload.context.title,
        subtitle: payload.context.subtitle,
        plazaTag: payload.context.plazaTag,
        updatedAt: new Date(payload.comment.createdAt),
      },
      select: {
        id: true,
      },
    });

    await prisma.contextComment.upsert({
      where: { id: payload.comment.id },
      update: {
        author: payload.comment.author,
        content: payload.comment.content,
        topic: payload.comment.topic ?? null,
        anchorLabel: payload.comment.anchorLabel ?? null,
        anchorText: payload.comment.anchorText ?? null,
        promotedAt: payload.comment.promotedAt ? new Date(payload.comment.promotedAt) : null,
        createdAt: new Date(payload.comment.createdAt),
      },
      create: {
        id: payload.comment.id,
        threadId: thread.id,
        userId,
        author: payload.comment.author,
        content: payload.comment.content,
        topic: payload.comment.topic ?? null,
        anchorLabel: payload.comment.anchorLabel ?? null,
        anchorText: payload.comment.anchorText ?? null,
        promotedAt: payload.comment.promotedAt ? new Date(payload.comment.promotedAt) : null,
        createdAt: new Date(payload.comment.createdAt),
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to save context comment", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const payload = toggleLikeSchema.parse(body);
    const userId = await resolveRequestUserId(request);

    const comment = await prisma.contextComment.findUnique({
      where: { id: payload.commentId },
      select: {
        id: true,
        likesCount: true,
      },
    });

    if (!comment) {
      return jsonError("Comment not found", 404);
    }

    const existingLike = await prisma.contextCommentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: payload.commentId,
          userId,
        },
      },
    });

    const liked = !existingLike;
    const nextLikes = liked ? comment.likesCount + 1 : Math.max(0, comment.likesCount - 1);

    if (existingLike) {
      await prisma.contextCommentLike.delete({
        where: { id: existingLike.id },
      });
    } else {
      await prisma.contextCommentLike.create({
        data: {
          commentId: payload.commentId,
          userId,
        },
      });
    }

    await prisma.contextComment.update({
      where: { id: payload.commentId },
      data: {
        likesCount: nextLikes,
      },
    });

    return NextResponse.json({ saved: true, liked, likes: nextLikes });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to update like", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const payload = promoteCommentSchema.parse(body);

    await prisma.contextComment.update({
      where: { id: payload.commentId },
      data: {
        promotedAt: new Date(payload.promotedAt),
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to update share status", 500);
  }
}
