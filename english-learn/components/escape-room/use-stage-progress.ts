"use client";

import { useEffect, useRef, useState } from "react";

import type { GameProgress, SceneId } from "@/components/escape-room/types";
import type { EscapeRoomStageRecord, EscapeRoomStageSlug } from "@/lib/escape-room-stage-progress";

type BootstrapArgs = {
  stage: EscapeRoomStageSlug;
  setProgress: (progress: GameProgress) => void;
  setScene: (scene: SceneId) => void;
};

type SaveArgs = {
  stage: EscapeRoomStageSlug;
  scene: SceneId;
  progress: GameProgress;
  bestSeconds: number | null;
  elapsedSeconds: number;
  remainingSeconds: number;
};

export function useEscapeRoomStageBootstrap({ stage, setProgress, setScene }: BootstrapArgs) {
  const [ready, setReady] = useState(false);
  const [persistedBestSeconds, setPersistedBestSeconds] = useState<number | null>(null);
  const [resumeElapsedSeconds, setResumeElapsedSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadStageRecord() {
      try {
        const response = await fetch(`/api/games/escape-room/stages/${stage}`, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          record?: EscapeRoomStageRecord | null;
        };

        if (cancelled || !payload.record) {
          return;
        }

        setPersistedBestSeconds(payload.record.bestSeconds ?? null);

        if (payload.record.started && !payload.record.escaped && payload.record.progressPayload) {
          setProgress(payload.record.progressPayload);
          setScene(payload.record.scene);
          setResumeElapsedSeconds(payload.record.lastElapsedSeconds ?? 0);
        }
      } catch {
        // Ignore bootstrap persistence failures and keep the game playable.
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void loadStageRecord();

    return () => {
      cancelled = true;
    };
  }, [setProgress, setScene, stage]);

  return {
    ready,
    persistedBestSeconds,
    resumeElapsedSeconds,
  };
}

export async function saveEscapeRoomStageRecord({
  stage,
  scene,
  progress,
  bestSeconds,
  elapsedSeconds,
  remainingSeconds,
}: SaveArgs) {
  const response = await fetch(`/api/games/escape-room/stages/${stage}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scene,
      progress,
      bestSeconds,
      elapsedSeconds,
      remainingSeconds,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save escape-room stage progress");
  }

  return response.json() as Promise<{ record?: EscapeRoomStageRecord }>;
}

export function useEscapeRoomStagePersistence({
  ready,
  stage,
  scene,
  progress,
  bestSeconds,
  elapsedSeconds,
  remainingSeconds,
}: SaveArgs & { ready: boolean }) {
  const lastSavedSnapshotKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const activeRun = progress.started && !progress.reward.escaped;
    const sampledElapsedSeconds = activeRun ? Math.floor(elapsedSeconds / 5) * 5 : elapsedSeconds;
    const sampledRemainingSeconds =
      activeRun && remainingSeconds > 0 ? Math.ceil(remainingSeconds / 5) * 5 : remainingSeconds;
    const snapshotKey = JSON.stringify({
      stage,
      scene,
      progress,
      bestSeconds,
      elapsedSeconds: sampledElapsedSeconds,
      remainingSeconds: sampledRemainingSeconds,
    });

    if (snapshotKey === lastSavedSnapshotKeyRef.current) {
      return;
    }

    lastSavedSnapshotKeyRef.current = snapshotKey;

    void saveEscapeRoomStageRecord({
      stage,
      scene,
      progress,
      bestSeconds,
      elapsedSeconds: sampledElapsedSeconds,
      remainingSeconds: sampledRemainingSeconds,
    }).catch(() => {
      if (lastSavedSnapshotKeyRef.current === snapshotKey) {
        lastSavedSnapshotKeyRef.current = null;
      }
    });
  }, [bestSeconds, elapsedSeconds, progress, ready, remainingSeconds, scene, stage]);
}
