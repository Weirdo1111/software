import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { calculateNextReview } from "@/lib/srs";

const createSchema = z.object({
  words: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        tag: z.string().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = createSchema.parse(body);
    const userId = await resolveRequestUserId(request);

    const existing = await prisma.reviewCard.findMany({
      where: {
        userId,
        OR: payload.words.map((word) => ({
          front: word.front,
          back: word.back,
        })),
      },
      select: {
        front: true,
        back: true,
      },
    });

    const existingSet = new Set(
      existing.map((item) => `${item.front.toLowerCase()}::${item.back.toLowerCase()}`),
    );

    const newWords = payload.words.filter((word) => {
      return !existingSet.has(`${word.front.toLowerCase()}::${word.back.toLowerCase()}`);
    });

    if (newWords.length === 0) {
      const skipped = payload.words.length;
      return NextResponse.json({
        saved: 0,
        skipped,
        persisted: true,
        message: `${skipped} card(s) already in your deck - no duplicates added.`,
      });
    }

    await prisma.reviewCard.createMany({
      data: newWords.map((word) => ({
        userId,
        front: word.front,
        back: word.back,
        tag: word.tag ?? "general",
        stability: 2,
        difficulty: 5,
        dueAt: new Date(),
      })),
    });

    const skipped = payload.words.length - newWords.length;
    return NextResponse.json({
      saved: newWords.length,
      skipped,
      persisted: true,
      message:
        skipped > 0
          ? `${newWords.length} card(s) added, ${skipped} duplicate(s) skipped.`
          : `${newWords.length} card(s) added to review deck.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to save vocabulary cards", 500);
  }
}

export async function GET(request: Request) {
  try {
    const userId = await resolveRequestUserId(request);
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter");
    const tag = url.searchParams.get("tag");

    const cards = await prisma.reviewCard.findMany({
      where: {
        userId,
        ...(filter === "due"
          ? {
              dueAt: {
                lte: new Date(),
              },
            }
          : {}),
        ...(tag ? { tag } : {}),
      },
      orderBy: {
        dueAt: "asc",
      },
    });

    const due = cards.filter((card) => card.dueAt <= new Date()).length;
    const mature = cards.filter((card) => card.stability >= 10).length;
    const atRisk = cards.filter((card) => card.lapses >= 3).length;

    const logs = await prisma.reviewLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        card: {
          select: {
            front: true,
          },
        },
      },
    });

    return NextResponse.json({
      cards: cards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        tag: card.tag,
        stability: card.stability,
        difficulty: card.difficulty,
        due_at: card.dueAt.toISOString(),
        last_reviewed_at: card.lastReviewedAt?.toISOString() ?? null,
        lapses: card.lapses,
        created_at: card.createdAt.toISOString(),
      })),
      stats: { due, total: cards.length, mature, at_risk: atRisk },
      review_history: logs.map((log) => ({
        id: log.id,
        card_front: log.card.front,
        rating: log.rating,
        reviewed_at: log.createdAt.toISOString(),
      })),
      persisted: true,
    });
  } catch {
    return jsonError("Failed to load review cards", 500);
  }
}

const reviewSchema = z.object({
  card_id: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  stability: z.number().optional(),
  difficulty: z.number().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const payload = reviewSchema.parse(body);
    const userId = await resolveRequestUserId(request);

    const card = await prisma.reviewCard.findFirst({
      where: {
        id: payload.card_id,
        userId,
      },
    });

    if (!card) {
      return jsonError("Card not found", 404);
    }

    const result = calculateNextReview({
      stability: Number(card.stability),
      difficulty: Number(card.difficulty),
      rating: payload.rating,
    });

    const nextLapses = payload.rating <= 1 ? card.lapses + 1 : card.lapses;
    const reviewedAt = new Date();

    await prisma.reviewCard.update({
      where: { id: payload.card_id },
      data: {
        stability: result.next_stability,
        difficulty: result.next_difficulty,
        dueAt: new Date(result.next_due_at),
        lastReviewedAt: reviewedAt,
        lapses: nextLapses,
      },
    });

    await prisma.reviewLog.create({
      data: {
        cardId: payload.card_id,
        userId,
        rating: payload.rating,
        nextDueAt: new Date(result.next_due_at),
      },
    });

    return NextResponse.json({ ...result, persisted: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to submit review", 500);
  }
}

const deleteSchema = z.object({
  card_id: z.string().min(1),
});

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const payload = deleteSchema.parse(body);
    const userId = await resolveRequestUserId(request);

    const deleted = await prisma.reviewCard.deleteMany({
      where: {
        id: payload.card_id,
        userId,
      },
    });

    if (deleted.count === 0) {
      return jsonError("Card not found", 404);
    }

    return NextResponse.json({ deleted: true, persisted: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }
    return jsonError("Failed to delete card", 500);
  }
}
