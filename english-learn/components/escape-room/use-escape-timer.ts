"use client";

import { useEffect, useRef, useState } from "react";

import { ESCAPE_ROOM_BEST_TIME_KEY } from "@/components/escape-room/time-utils";
import {
  DORM_LOCKOUT_CLEAR_KEY,
  ESCAPE_ROOM_CLEAR_KEY,
  LAST_TRAIN_CLEAR_KEY,
} from "@/lib/buddy-xp-config";
import { awardBuddyXpInStorage } from "@/lib/buddy-xp";

export function useEscapeTimer({
  started,
  escaped,
  durationSeconds,
  bestTimeKey = ESCAPE_ROOM_BEST_TIME_KEY,
  initialBestSeconds = null,
  resumeElapsedSeconds = 0,
}: {
  started: boolean;
  escaped: boolean;
  durationSeconds: number;
  bestTimeKey?: string;
  initialBestSeconds?: number | null;
  resumeElapsedSeconds?: number;
}) {
  const startedAtRef = useRef<number | null>(null);
  const savedForRunRef = useRef(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [storedBestSeconds, setStoredBestSeconds] = useState<number | null>(() => {
    if (typeof window === "undefined") {
      return initialBestSeconds;
    }

    const stored = window.localStorage.getItem(bestTimeKey);
    return stored ? Number(stored) : initialBestSeconds;
  });

  useEffect(() => {
    if (initialBestSeconds === null || initialBestSeconds === undefined) {
      return;
    }

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(bestTimeKey);
      if (!stored || Number(stored) > initialBestSeconds) {
        window.localStorage.setItem(bestTimeKey, String(initialBestSeconds));
      }
    }
  }, [bestTimeKey, initialBestSeconds]);

  const bestSeconds =
    initialBestSeconds === null || initialBestSeconds === undefined
      ? storedBestSeconds
      : storedBestSeconds === null
        ? initialBestSeconds
        : Math.min(storedBestSeconds, initialBestSeconds);

  useEffect(() => {
    if (!started) {
      startedAtRef.current = null;
      savedForRunRef.current = false;
      return;
    }

    if (startedAtRef.current === null) {
      const resumeSeconds = Math.max(0, Math.floor(resumeElapsedSeconds));
      startedAtRef.current = Date.now() - resumeSeconds * 1000;
      savedForRunRef.current = false;
    }
  }, [resumeElapsedSeconds, started]);

  useEffect(() => {
    if (!started || escaped || startedAtRef.current === null) {
      return;
    }

    const updateElapsed = () => {
      if (startedAtRef.current === null) {
        return;
      }

      setElapsedSeconds(Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000)));
    };

    updateElapsed();
    const timerId = window.setInterval(updateElapsed, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [started, escaped]);

  useEffect(() => {
    if (!escaped || startedAtRef.current === null || savedForRunRef.current) {
      return;
    }

    const finalSeconds = Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
    setElapsedSeconds(finalSeconds);

    if (bestSeconds === null || finalSeconds < bestSeconds) {
      setStoredBestSeconds(finalSeconds);

      if (typeof window !== "undefined") {
        const isFirstClear = window.localStorage.getItem(bestTimeKey) === null;
        window.localStorage.setItem(bestTimeKey, String(finalSeconds));
        if (isFirstClear) {
          if (bestTimeKey === ESCAPE_ROOM_CLEAR_KEY) void awardBuddyXpInStorage("escapeRoomClear").catch(() => undefined);
          if (bestTimeKey === DORM_LOCKOUT_CLEAR_KEY) void awardBuddyXpInStorage("dormLockoutClear").catch(() => undefined);
          if (bestTimeKey === LAST_TRAIN_CLEAR_KEY) void awardBuddyXpInStorage("lastTrainClear").catch(() => undefined);
        }
      }
    }

    savedForRunRef.current = true;
  }, [bestSeconds, bestTimeKey, escaped]);

  const resetTimer = () => {
    startedAtRef.current = null;
    savedForRunRef.current = false;
    setElapsedSeconds(0);
  };

  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
  const expired = started && !escaped && remainingSeconds === 0;

  return {
    elapsedSeconds,
    bestSeconds,
    remainingSeconds,
    expired,
    resetTimer,
  };
}
