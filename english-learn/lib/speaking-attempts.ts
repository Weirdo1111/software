import type { SpeakingAttemptRecord } from "@/types/learning";

interface SpeakingAttemptsSnapshot {
  attempts: SpeakingAttemptRecord[];
}

export const SPEAKING_ATTEMPTS_KEY = "english-learn:speaking:attempts";
const SPEAKING_ATTEMPTS_EVENT = "english-learn:speaking:attempts:changed";
const MAX_SPEAKING_ATTEMPTS = 24;
const EMPTY_SPEAKING_ATTEMPTS_SNAPSHOT: SpeakingAttemptsSnapshot = {
  attempts: [],
};

let cachedSpeakingAttemptsSnapshot: SpeakingAttemptsSnapshot = EMPTY_SPEAKING_ATTEMPTS_SNAPSHOT;

function isSpeakingAttemptRecord(value: unknown): value is SpeakingAttemptRecord {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as SpeakingAttemptRecord).id === "string" &&
    typeof (value as SpeakingAttemptRecord).prompt_id === "string" &&
    typeof (value as SpeakingAttemptRecord).prompt_title === "string" &&
    typeof (value as SpeakingAttemptRecord).target_level === "string" &&
    typeof (value as SpeakingAttemptRecord).major_id === "string" &&
    typeof (value as SpeakingAttemptRecord).category === "string" &&
    typeof (value as SpeakingAttemptRecord).transcript === "string" &&
    typeof (value as SpeakingAttemptRecord).overall_score === "number" &&
    typeof (value as SpeakingAttemptRecord).task_response_score === "number" &&
    typeof (value as SpeakingAttemptRecord).pronunciation_score === "number" &&
    typeof (value as SpeakingAttemptRecord).fluency_score === "number" &&
    typeof (value as SpeakingAttemptRecord).grammar_score === "number" &&
    Array.isArray((value as SpeakingAttemptRecord).strengths) &&
    typeof (value as SpeakingAttemptRecord).revision_focus === "string" &&
    Array.isArray((value as SpeakingAttemptRecord).tips) &&
    typeof (value as SpeakingAttemptRecord).created_at === "string"
  );
}

function isSpeakingAttemptArray(value: unknown): value is SpeakingAttemptRecord[] {
  return Array.isArray(value) && value.every((item) => isSpeakingAttemptRecord(item));
}

function safeParse<T>(raw: string | null, fallback: T, guard: (value: unknown) => value is T): T {
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return guard(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function sortAttemptsByLatest(attempts: SpeakingAttemptRecord[]) {
  return [...attempts].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function appendSpeakingAttempt(
  attempts: SpeakingAttemptRecord[],
  nextAttempt: SpeakingAttemptRecord,
) {
  return sortAttemptsByLatest([nextAttempt, ...attempts]).slice(0, MAX_SPEAKING_ATTEMPTS);
}

export function loadSpeakingAttemptsFromStorage() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(SPEAKING_ATTEMPTS_KEY), [], isSpeakingAttemptArray);
}

function saveSpeakingAttemptsToStorage(attempts: SpeakingAttemptRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SPEAKING_ATTEMPTS_KEY, JSON.stringify(attempts));
}

function createSpeakingAttemptsSnapshot(): SpeakingAttemptsSnapshot {
  return {
    attempts: loadSpeakingAttemptsFromStorage(),
  };
}

function snapshotsMatch(left: SpeakingAttemptsSnapshot, right: SpeakingAttemptsSnapshot) {
  return (
    left.attempts.length === right.attempts.length &&
    left.attempts.every((attempt, index) => {
      const nextAttempt = right.attempts[index];
      return attempt.id === nextAttempt?.id && attempt.created_at === nextAttempt?.created_at;
    })
  );
}

function updateCachedSnapshot(nextSnapshot: SpeakingAttemptsSnapshot) {
  if (snapshotsMatch(cachedSpeakingAttemptsSnapshot, nextSnapshot)) {
    return cachedSpeakingAttemptsSnapshot;
  }

  cachedSpeakingAttemptsSnapshot = nextSnapshot;
  return cachedSpeakingAttemptsSnapshot;
}

export function getSpeakingAttemptsSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_SPEAKING_ATTEMPTS_SNAPSHOT;
  }

  return updateCachedSnapshot(createSpeakingAttemptsSnapshot());
}

export function getSpeakingAttemptsServerSnapshot() {
  return EMPTY_SPEAKING_ATTEMPTS_SNAPSHOT;
}

export function subscribeSpeakingAttempts(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  function handleChange() {
    updateCachedSnapshot(createSpeakingAttemptsSnapshot());
    callback();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(SPEAKING_ATTEMPTS_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SPEAKING_ATTEMPTS_EVENT, handleChange);
  };
}

function emitSpeakingAttemptsChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SPEAKING_ATTEMPTS_EVENT));
}

export function appendSpeakingAttemptInStorage(nextAttempt: SpeakingAttemptRecord) {
  const nextAttempts = appendSpeakingAttempt(getSpeakingAttemptsSnapshot().attempts, nextAttempt);
  saveSpeakingAttemptsToStorage(nextAttempts);
  updateCachedSnapshot({
    attempts: nextAttempts,
  });
  emitSpeakingAttemptsChange();
  return nextAttempts;
}
