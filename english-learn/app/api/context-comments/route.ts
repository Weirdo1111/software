import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestUserId, jsonError } from "@/lib/api";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

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
  updatedAt: string;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    created_at: string;
    topic: string | null;
    likes_count: number;
    anchor_label: string | null;
    anchor_text: string | null;
    promoted_at: string | null;
    liked: boolean;
  }>;
}) {
  return {
    id: `${input.context.module}:${input.context.targetId}`,
    module: input.context.module,
    targetId: input.context.targetId,
    title: input.context.title,
    subtitle: input.context.subtitle,
    updatedAt: input.updatedAt,
    comments: input.comments.map((comment) => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      createdAt: comment.created_at,
      topic: comment.topic ?? undefined,
      likes: comment.likes_count,
      liked: comment.liked,
      anchorLabel: comment.anchor_label ?? undefined,
      anchorText: comment.anchor_text ?? undefined,
      promotedAt: comment.promoted_at ?? undefined,
    })),
  };
}

async function loadThread(
  userId: string,
  module: string,
  targetId: string,
  fallbackContext?: z.infer<typeof contextSchema>,
) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data: thread } = await supabase
    .from("context_comment_threads")
    .select("id, title, subtitle, plaza_tag, updated_at, module, target_id")
    .eq("module", module)
    .eq("target_id", targetId)
    .maybeSingle();

  if (!thread) return null;

  const { data: comments } = await supabase
    .from("context_comments")
    .select("id, author, content, created_at, topic, likes_count, anchor_label, anchor_text, promoted_at")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const commentIds = (comments ?? []).map((item) => item.id);
  const { data: likes } =
    commentIds.length > 0
      ? await supabase
          .from("context_comment_likes")
          .select("comment_id")
          .eq("user_id", userId)
          .in("comment_id", commentIds)
      : { data: [] as Array<{ comment_id: string }> };

  const likedIds = new Set((likes ?? []).map((item) => item.comment_id));
  const context =
    fallbackContext ??
    ({
      module: thread.module,
      targetId: thread.target_id,
      title: thread.title,
      subtitle: thread.subtitle ?? undefined,
      plazaTag: thread.plaza_tag,
    } satisfies z.infer<typeof contextSchema>);

  return mapThreadResponse({
    context,
    updatedAt: thread.updated_at,
    comments: (comments ?? []).map((item) => ({
      ...item,
      liked: likedIds.has(item.id),
    })),
  });
}

export async function GET(request: Request) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ thread: null });
  }

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

  const userId = getRequestUserId(request);
  const thread = await loadThread(userId, query.data.module, query.data.targetId, query.data);
  return NextResponse.json({ thread });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = addCommentSchema.parse(body);
    const userId = getRequestUserId(request);
    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ saved: false, fallback: true });
    }

    const { data: thread, error: threadError } = await supabase
      .from("context_comment_threads")
      .upsert(
        {
          module: payload.context.module,
          target_id: payload.context.targetId,
          title: payload.context.title,
          subtitle: payload.context.subtitle,
          plaza_tag: payload.context.plazaTag,
          updated_at: payload.comment.createdAt,
        },
        { onConflict: "module,target_id" },
      )
      .select("id")
      .single();

    if (threadError || !thread) {
      return jsonError("Failed to save discussion thread", 500);
    }

    const { error: commentError } = await supabase.from("context_comments").upsert(
      {
        id: payload.comment.id,
        thread_id: thread.id,
        user_id: userId,
        author: payload.comment.author,
        content: payload.comment.content,
        topic: payload.comment.topic ?? null,
        anchor_label: payload.comment.anchorLabel ?? null,
        anchor_text: payload.comment.anchorText ?? null,
        promoted_at: payload.comment.promotedAt ?? null,
        created_at: payload.comment.createdAt,
      },
      { onConflict: "id" },
    );

    if (commentError) {
      return jsonError("Failed to save comment", 500);
    }

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
    const userId = getRequestUserId(request);
    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ saved: false, fallback: true });
    }

    const { data: comment } = await supabase
      .from("context_comments")
      .select("id, likes_count")
      .eq("id", payload.commentId)
      .maybeSingle();

    if (!comment) {
      return jsonError("Comment not found", 404);
    }

    const { data: existingLike } = await supabase
      .from("context_comment_likes")
      .select("id")
      .eq("comment_id", payload.commentId)
      .eq("user_id", userId)
      .maybeSingle();

    const liked = !existingLike;
    const nextLikes = liked ? comment.likes_count + 1 : Math.max(0, comment.likes_count - 1);

    if (existingLike) {
      await supabase.from("context_comment_likes").delete().eq("id", existingLike.id);
    } else {
      await supabase.from("context_comment_likes").insert({
        comment_id: payload.commentId,
        user_id: userId,
      });
    }

    await supabase
      .from("context_comments")
      .update({ likes_count: nextLikes })
      .eq("id", payload.commentId);

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
    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ saved: false, fallback: true });
    }

    const { error } = await supabase
      .from("context_comments")
      .update({ promoted_at: payload.promotedAt })
      .eq("id", payload.commentId);

    if (error) {
      return jsonError("Failed to update discussion share status", 500);
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to update share status", 500);
  }
}
