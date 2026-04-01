import { awardBuddyXpInStorage } from "@/lib/buddy-xp";

export interface ReviewProgressSnapshot {
  completedSessions: number;
  lastCompletedAt: string | null;
}

export const REVIEW_PROGRESS_KEY = "english-learn:review:progress";
const REVIEW_PROGRESS_EVENT = "english-learn:review:progress:changed";

const EMPTY_REVIEW_PROGRESS_SNAPSHOT: ReviewProgressSnapshot = {
  completedSessions: 0,
  lastCompletedAt: null,
};

function isReviewProgressSnapshot(value: unknown): value is ReviewProgressSnapshot {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as ReviewProgressSnapshot).completedSessions === "number" &&
    (((value as ReviewProgressSnapshot).lastCompletedAt === null) ||
      typeof (value as ReviewProgressSnapshot).lastCompletedAt === "string")
  );
}

function safeParseSnapshot(raw: string | null): ReviewProgressSnapshot {
  if (!raw) return EMPTY_REVIEW_PROGRESS_SNAPSHOT;

  try {
    const parsed = JSON.parse(raw);
    return isReviewProgressSnapshot(parsed) ? parsed : EMPTY_REVIEW_PROGRESS_SNAPSHOT;
  } catch {
    return EMPTY_REVIEW_PROGRESS_SNAPSHOT;
  }
}

export function loadReviewProgressFromStorage() {
  if (typeof window === "undefined") return EMPTY_REVIEW_PROGRESS_SNAPSHOT;
  return safeParseSnapshot(window.localStorage.getItem(REVIEW_PROGRESS_KEY));
}

function saveReviewProgressToStorage(snapshot: ReviewProgressSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REVIEW_PROGRESS_KEY, JSON.stringify(snapshot));
}

function emitReviewProgressChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(REVIEW_PROGRESS_EVENT));
}

export function recordReviewSessionCompletionInStorage(completedAt = new Date().toISOString()) {
  const current = loadReviewProgressFromStorage();
  const nextSnapshot: ReviewProgressSnapshot = {
    completedSessions: current.completedSessions + 1,
    lastCompletedAt: completedAt,
  };

  saveReviewProgressToStorage(nextSnapshot);
  emitReviewProgressChange();
  void awardBuddyXpInStorage("reviewSession").catch(() => undefined);
  return nextSnapshot;
}

export function subscribeReviewProgress(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === REVIEW_PROGRESS_KEY) {
      callback();
    }
  };

  const onChanged = () => {
    callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REVIEW_PROGRESS_EVENT, onChanged);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REVIEW_PROGRESS_EVENT, onChanged);
  };
}
