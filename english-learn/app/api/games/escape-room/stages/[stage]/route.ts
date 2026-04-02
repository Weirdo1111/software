import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import type { GameProgress, SceneId } from "@/components/escape-room/types";
import { jsonError, resolveRequestUserId } from "@/lib/api";
import { type EscapeRoomStageRecord, ESCAPE_ROOM_STAGE_VALUES } from "@/lib/escape-room-stage-progress";
import { isDatabaseAuthConfigured } from "@/lib/local-auth";
import { prisma } from "@/lib/prisma";

const stageSchema = z.enum(ESCAPE_ROOM_STAGE_VALUES);
const sceneSchema = z.enum(["briefing", "library", "exit"]);

const progressSchema: z.ZodType<GameProgress> = z.object({
  started: z.boolean(),
  phase: z.enum(["intro", "exploring", "cart-found", "shelf-found", "desk-opened", "audio-complete", "ready-to-unlock", "escaped"]),
  currentObjective: z.string(),
  completedPuzzles: z.object({
    "notice-board": z.boolean(),
    "return-cart": z.boolean(),
    bookshelf: z.boolean(),
    "circulation-desk": z.boolean(),
    speaker: z.boolean(),
    "floor-map": z.boolean(),
  }),
  inventory: z.object({
    clues: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.string(),
        kind: z.enum(["code", "intel"]),
        source: z.enum(["notice-board", "return-cart", "bookshelf", "circulation-desk", "speaker", "floor-map"]),
        description: z.string(),
      }),
    ),
    items: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.string().optional(),
        source: z.enum(["notice-board", "return-cart", "bookshelf", "circulation-desk", "speaker", "floor-map"]),
        description: z.string(),
        used: z.boolean(),
      }),
    ),
    notes: z.array(z.string()),
  }),
  reward: z.object({
    xpEarned: z.number().int(),
    badgeUnlocked: z.string().nullable(),
    escaped: z.boolean(),
  }),
  keypadAttempts: z.number().int().min(0),
});

const putSchema = z.object({
  scene: sceneSchema,
  progress: progressSchema,
  bestSeconds: z.number().int().positive().nullable().optional(),
  elapsedSeconds: z.number().int().min(0).nullable().optional(),
  remainingSeconds: z.number().int().min(0).nullable().optional(),
});

function serializeRecord(record: {
  stageSlug: string;
  status: string;
  scene: string;
  started: boolean;
  escaped: boolean;
  bestSeconds: number | null;
  lastElapsedSeconds: number | null;
  lastRemainingSeconds: number | null;
  keypadAttempts: number;
  clearCount: number;
  latestRunStartedAt: Date | null;
  latestClearedAt: Date | null;
  progressPayload: unknown;
  createdAt: Date;
  updatedAt: Date;
}): EscapeRoomStageRecord {
  return {
    stageSlug: stageSchema.parse(record.stageSlug),
    status: record.status,
    scene: sceneSchema.parse(record.scene) as SceneId,
    started: record.started,
    escaped: record.escaped,
    bestSeconds: record.bestSeconds,
    lastElapsedSeconds: record.lastElapsedSeconds,
    lastRemainingSeconds: record.lastRemainingSeconds,
    keypadAttempts: record.keypadAttempts,
    clearCount: record.clearCount,
    latestRunStartedAt: record.latestRunStartedAt?.toISOString() ?? null,
    latestClearedAt: record.latestClearedAt?.toISOString() ?? null,
    progressPayload: record.progressPayload ? progressSchema.parse(record.progressPayload) : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function createRunHistoryEntry(input: {
  userId: bigint;
  stageSlug: string;
  result: string;
  startedAt: Date | null;
  endedAt?: Date;
  elapsedSeconds: number | null;
  remainingSeconds: number | null;
  keypadAttempts: number;
  rewardXp: number;
  progress: GameProgress;
}) {
  await prisma.escapeRoomRun.create({
    data: {
      userId: input.userId,
      stageSlug: input.stageSlug,
      result: input.result,
      startedAt: input.startedAt,
      endedAt: input.endedAt ?? new Date(),
      elapsedSeconds: input.elapsedSeconds,
      remainingSeconds: input.remainingSeconds,
      keypadAttempts: input.keypadAttempts,
      rewardXp: input.rewardXp,
      progressPayload: input.progress as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function GET(request: Request, context: { params: Promise<{ stage: string }> }) {
  if (!isDatabaseAuthConfigured()) {
    return jsonError("Database is not configured", 503);
  }

  try {
    const { stage } = await context.params;
    const stageSlug = stageSchema.parse(stage);
    const userId = await resolveRequestUserId(request);
    const record = await prisma.escapeRoomStageProgress.findUnique({
      where: {
        userId_stageSlug: {
          userId,
          stageSlug,
        },
      },
    });

    return NextResponse.json({
      record: record ? serializeRecord(record) : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid stage", 422);
    }

    return jsonError("Failed to load escape-room stage progress", 500);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ stage: string }> }) {
  if (!isDatabaseAuthConfigured()) {
    return jsonError("Database is not configured", 503);
  }

  try {
    const { stage } = await context.params;
    const stageSlug = stageSchema.parse(stage);
    const payload = putSchema.parse(await request.json());
    const userId = await resolveRequestUserId(request);
    const existing = await prisma.escapeRoomStageProgress.findUnique({
      where: {
        userId_stageSlug: {
          userId,
          stageSlug,
        },
      },
    });

    const escaped = payload.progress.reward.escaped;
    const started = payload.progress.started;
    const nextBestSeconds =
      payload.bestSeconds === null || payload.bestSeconds === undefined
        ? existing?.bestSeconds ?? null
        : existing?.bestSeconds === null || existing?.bestSeconds === undefined
          ? payload.bestSeconds
          : Math.min(existing.bestSeconds, payload.bestSeconds);
    const didJustClear = escaped && !existing?.escaped;
    const latestRunStartedAt =
      started && !escaped && (!existing?.started || existing.escaped || !existing.latestRunStartedAt)
        ? new Date()
        : started
          ? existing?.latestRunStartedAt ?? null
          : null;
    const endedAt = new Date();

    if (escaped && !existing?.escaped) {
      await createRunHistoryEntry({
        userId,
        stageSlug,
        result: "cleared",
        startedAt: existing?.latestRunStartedAt ?? latestRunStartedAt,
        endedAt,
        elapsedSeconds: payload.elapsedSeconds ?? null,
        remainingSeconds: payload.remainingSeconds ?? null,
        keypadAttempts: payload.progress.keypadAttempts,
        rewardXp: payload.progress.reward.xpEarned,
        progress: payload.progress,
      });
    } else if (existing?.started && !started && !existing.escaped) {
      await createRunHistoryEntry({
        userId,
        stageSlug,
        result: existing.lastRemainingSeconds === 0 ? "failed" : "abandoned",
        startedAt: existing.latestRunStartedAt ?? null,
        endedAt,
        elapsedSeconds: existing.lastElapsedSeconds,
        remainingSeconds: existing.lastRemainingSeconds,
        keypadAttempts: existing.keypadAttempts,
        rewardXp: 0,
        progress: existing.progressPayload ? progressSchema.parse(existing.progressPayload) : payload.progress,
      });
    }

    const nextRecord = await prisma.escapeRoomStageProgress.upsert({
      where: {
        userId_stageSlug: {
          userId,
          stageSlug,
        },
      },
      create: {
        userId,
        stageSlug,
        status: escaped ? "escaped" : started ? "in_progress" : "idle",
        scene: payload.scene,
        started,
        escaped,
        bestSeconds: nextBestSeconds,
        lastElapsedSeconds: payload.elapsedSeconds ?? null,
        lastRemainingSeconds: payload.remainingSeconds ?? null,
        keypadAttempts: payload.progress.keypadAttempts,
        clearCount: escaped ? 1 : 0,
        latestRunStartedAt,
        latestClearedAt: escaped ? endedAt : null,
        progressPayload: payload.progress as unknown as Prisma.InputJsonValue,
      },
      update: {
        status: escaped ? "escaped" : started ? "in_progress" : "idle",
        scene: payload.scene,
        started,
        escaped,
        bestSeconds: nextBestSeconds,
        lastElapsedSeconds: payload.elapsedSeconds ?? null,
        lastRemainingSeconds: payload.remainingSeconds ?? null,
        keypadAttempts: payload.progress.keypadAttempts,
        clearCount: existing ? existing.clearCount + (didJustClear ? 1 : 0) : escaped ? 1 : 0,
        latestRunStartedAt,
        latestClearedAt: didJustClear ? endedAt : existing?.latestClearedAt ?? null,
        progressPayload: payload.progress as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      record: serializeRecord(nextRecord),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid escape-room progress payload", 422);
    }

    return jsonError("Failed to save escape-room stage progress", 500);
  }
}
