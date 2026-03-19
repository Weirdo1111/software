"use client";

import { useSyncExternalStore } from "react";

import {
  appendSpeakingAttemptInStorage,
  getSpeakingAttemptsServerSnapshot,
  getSpeakingAttemptsSnapshot,
  subscribeSpeakingAttempts,
} from "@/lib/speaking-attempts";

export function useSpeakingAttemptHistory() {
  const snapshot = useSyncExternalStore(
    subscribeSpeakingAttempts,
    getSpeakingAttemptsSnapshot,
    getSpeakingAttemptsServerSnapshot,
  );

  return {
    attempts: snapshot.attempts,
    hydrated: true,
    addAttempt: appendSpeakingAttemptInStorage,
  };
}
