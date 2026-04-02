import { NextResponse } from "next/server";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import {
  type EscapeRoomLeaderboardEntry,
  type EscapeRoomRunHistoryEntry,
  type EscapeRoomStageRecord,
  ESCAPE_ROOM_STAGE_VALUES,
} from "@/lib/escape-room-stage-progress";
import { isDatabaseAuthConfigured } from "@/lib/local-auth";
import { prisma } from "@/lib/prisma";

function toStageRecord(record: {
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
    stageSlug: record.stageSlug as EscapeRoomStageRecord["stageSlug"],
    status: record.status,
    scene: record.scene as EscapeRoomStageRecord["scene"],
    started: record.started,
    escaped: record.escaped,
    bestSeconds: record.bestSeconds,
    lastElapsedSeconds: record.lastElapsedSeconds,
    lastRemainingSeconds: record.lastRemainingSeconds,
    keypadAttempts: record.keypadAttempts,
    clearCount: record.clearCount,
    latestRunStartedAt: record.latestRunStartedAt?.toISOString() ?? null,
    latestClearedAt: record.latestClearedAt?.toISOString() ?? null,
    progressPayload: (record.progressPayload as EscapeRoomStageRecord["progressPayload"]) ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toRunHistoryEntry(run: {
  id: string;
  stageSlug: string;
  result: string;
  startedAt: Date | null;
  endedAt: Date;
  elapsedSeconds: number | null;
  remainingSeconds: number | null;
  keypadAttempts: number;
  rewardXp: number;
}): EscapeRoomRunHistoryEntry {
  return {
    id: run.id,
    stageSlug: run.stageSlug as EscapeRoomRunHistoryEntry["stageSlug"],
    result: run.result,
    startedAt: run.startedAt?.toISOString() ?? null,
    endedAt: run.endedAt.toISOString(),
    elapsedSeconds: run.elapsedSeconds,
    remainingSeconds: run.remainingSeconds,
    keypadAttempts: run.keypadAttempts,
    rewardXp: run.rewardXp,
  };
}

export async function GET(request: Request) {
  if (!isDatabaseAuthConfigured()) {
    return jsonError("Database is not configured", 503);
  }

  try {
    const userId = await resolveRequestUserId(request);
    const [stages, history, leaderboards] = await Promise.all([
      prisma.escapeRoomStageProgress.findMany({
        where: { userId },
        orderBy: { stageSlug: "asc" },
      }),
      prisma.escapeRoomRun.findMany({
        where: { userId },
        orderBy: { endedAt: "desc" },
        take: 12,
      }),
      Promise.all(
        ESCAPE_ROOM_STAGE_VALUES.map(async (stageSlug) => {
          const rows = await prisma.escapeRoomStageProgress.findMany({
            where: {
              stageSlug,
              escaped: true,
              bestSeconds: {
                not: null,
              },
            },
            select: {
              bestSeconds: true,
              clearCount: true,
              user: {
                select: {
                  displayName: true,
                  username: true,
                },
              },
            },
            orderBy: [{ bestSeconds: "asc" }, { clearCount: "desc" }],
            take: 5,
          });

          return [
            stageSlug,
            rows.map((row) => ({
              userDisplayName: row.user.displayName || row.user.username,
              bestSeconds: row.bestSeconds ?? 0,
              clearCount: row.clearCount,
            })) satisfies EscapeRoomLeaderboardEntry[],
          ] as const;
        }),
      ),
    ]);

    return NextResponse.json({
      stages: stages.map(toStageRecord),
      history: history.map(toRunHistoryEntry),
      leaderboards: Object.fromEntries(leaderboards) as Record<string, EscapeRoomLeaderboardEntry[]>,
    });
  } catch {
    return jsonError("Failed to load escape-room overview", 500);
  }
}
