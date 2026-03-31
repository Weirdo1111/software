import {
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
} from "@/lib/learning-tracker";
import {
  loadReviewProgressFromStorage,
  subscribeReviewProgress,
} from "@/lib/review-progress";
import {
  BUDDY_XP_RULES,
  DORM_LOCKOUT_CLEAR_KEY,
  ESCAPE_ROOM_CLEAR_KEY,
  LAST_TRAIN_CLEAR_KEY,
} from "@/lib/buddy-xp-config";

export interface BuddyXpSourceCounts {
  listeningCompletions: number;
  speakingCompletions: number;
  readingCompletions: number;
  writingCompletions: number;
  reviewSessions: number;
  escapeRoomClears: number;
  dormLockoutClears: number;
  lastTrainClears: number;
}

export interface BuddyXpSummary {
  totalXp: number;
  totalCompletedSources: number;
  counts: BuddyXpSourceCounts;
}

function hasStoredValue(key: string) {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(key);
  return typeof raw === "string" && raw.trim().length > 0;
}

export function getBuddyXpSummaryFromStorage(): BuddyXpSummary {
  const learningSnapshot = loadLearningTrackerSnapshotFromStorage();
  const reviewProgress = loadReviewProgressFromStorage();

  const counts: BuddyXpSourceCounts = {
    listeningCompletions: learningSnapshot.skills.listening.completed,
    speakingCompletions: learningSnapshot.skills.speaking.completed,
    readingCompletions: learningSnapshot.skills.reading.completed,
    writingCompletions: learningSnapshot.skills.writing.completed,
    reviewSessions: reviewProgress.completedSessions,
    escapeRoomClears: hasStoredValue(ESCAPE_ROOM_CLEAR_KEY) ? 1 : 0,
    dormLockoutClears: hasStoredValue(DORM_LOCKOUT_CLEAR_KEY) ? 1 : 0,
    lastTrainClears: hasStoredValue(LAST_TRAIN_CLEAR_KEY) ? 1 : 0,
  };

  const totalXp =
    counts.listeningCompletions * BUDDY_XP_RULES.listeningCompletion +
    counts.speakingCompletions * BUDDY_XP_RULES.speakingCompletion +
    counts.readingCompletions * BUDDY_XP_RULES.readingCompletion +
    counts.writingCompletions * BUDDY_XP_RULES.writingCompletion +
    counts.reviewSessions * BUDDY_XP_RULES.reviewSession +
    counts.escapeRoomClears * BUDDY_XP_RULES.escapeRoomClear +
    counts.dormLockoutClears * BUDDY_XP_RULES.dormLockoutClear +
    counts.lastTrainClears * BUDDY_XP_RULES.lastTrainClear;

  const totalCompletedSources =
    counts.listeningCompletions +
    counts.speakingCompletions +
    counts.readingCompletions +
    counts.writingCompletions +
    counts.reviewSessions +
    counts.escapeRoomClears +
    counts.dormLockoutClears +
    counts.lastTrainClears;

  return {
    totalXp,
    totalCompletedSources,
    counts,
  };
}

export function subscribeBuddyXpSources(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const unsubscribeLearning = subscribeLearningTracker(callback);
  const unsubscribeReview = subscribeReviewProgress(callback);

  const onStorage = (event: StorageEvent) => {
    if (
      !event.key ||
      event.key === ESCAPE_ROOM_CLEAR_KEY ||
      event.key === DORM_LOCKOUT_CLEAR_KEY ||
      event.key === LAST_TRAIN_CLEAR_KEY
    ) {
      callback();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    unsubscribeLearning();
    unsubscribeReview();
    window.removeEventListener("storage", onStorage);
  };
}
