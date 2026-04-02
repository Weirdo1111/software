import type { GameProgress, SceneId } from "@/components/escape-room/types";

export const ESCAPE_ROOM_STAGE_VALUES = ["library", "dorm", "station"] as const;
export type EscapeRoomStageSlug = (typeof ESCAPE_ROOM_STAGE_VALUES)[number];

export type EscapeRoomStageRecord = {
  stageSlug: EscapeRoomStageSlug;
  status: string;
  scene: SceneId;
  started: boolean;
  escaped: boolean;
  bestSeconds: number | null;
  lastElapsedSeconds: number | null;
  lastRemainingSeconds: number | null;
  keypadAttempts: number;
  clearCount: number;
  latestRunStartedAt: string | null;
  latestClearedAt: string | null;
  progressPayload: GameProgress | null;
  createdAt: string;
  updatedAt: string;
};

export type EscapeRoomLeaderboardEntry = {
  userDisplayName: string;
  bestSeconds: number;
  clearCount: number;
};

export type EscapeRoomRunHistoryEntry = {
  id: string;
  stageSlug: EscapeRoomStageSlug;
  result: string;
  startedAt: string | null;
  endedAt: string;
  elapsedSeconds: number | null;
  remainingSeconds: number | null;
  keypadAttempts: number;
  rewardXp: number;
};
