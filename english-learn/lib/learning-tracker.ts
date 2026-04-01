import { awardBuddyXpInStorage } from "@/lib/buddy-xp";

export type TrackedSkill = "listening" | "speaking" | "reading" | "writing";

export interface SkillProgressSnapshot {
  attempts: number;
  correct: number;
  minutes: number;
  completed: number;
  lastUpdatedAt: string | null;
}

export interface LearningTrackerSnapshot {
  startedAt: string;
  skills: Record<TrackedSkill, SkillProgressSnapshot>;
}

export interface SkillAttemptInput {
  correct: boolean;
  durationSec: number;
  markCompleted?: boolean;
}

export const LEARNING_TRACKER_KEY = "english-learn:learning-tracker";
const LEARNING_TRACKER_EVENT = "english-learn:learning-tracker:changed";

function createEmptySkillSnapshot(): SkillProgressSnapshot {
  return {
    attempts: 0,
    correct: 0,
    minutes: 0,
    completed: 0,
    lastUpdatedAt: null,
  };
}

export function createEmptyLearningTrackerSnapshot(): LearningTrackerSnapshot {
  return {
    startedAt: new Date().toISOString(),
    skills: {
      listening: createEmptySkillSnapshot(),
      speaking: createEmptySkillSnapshot(),
      reading: createEmptySkillSnapshot(),
      writing: createEmptySkillSnapshot(),
    },
  };
}

function isSkillProgressSnapshot(value: unknown): value is SkillProgressSnapshot {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as SkillProgressSnapshot).attempts === "number" &&
    typeof (value as SkillProgressSnapshot).correct === "number" &&
    typeof (value as SkillProgressSnapshot).minutes === "number" &&
    typeof (value as SkillProgressSnapshot).completed === "number" &&
    ((value as SkillProgressSnapshot).lastUpdatedAt === null ||
      typeof (value as SkillProgressSnapshot).lastUpdatedAt === "string")
  );
}

function isLearningTrackerSnapshot(value: unknown): value is LearningTrackerSnapshot {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as LearningTrackerSnapshot).startedAt === "string" &&
    Boolean((value as LearningTrackerSnapshot).skills) &&
    isSkillProgressSnapshot((value as LearningTrackerSnapshot).skills.listening) &&
    isSkillProgressSnapshot((value as LearningTrackerSnapshot).skills.speaking) &&
    isSkillProgressSnapshot((value as LearningTrackerSnapshot).skills.reading) &&
    isSkillProgressSnapshot((value as LearningTrackerSnapshot).skills.writing)
  );
}

function safeParseSnapshot(raw: string | null): LearningTrackerSnapshot {
  if (!raw) return createEmptyLearningTrackerSnapshot();

  try {
    const parsed = JSON.parse(raw);
    return isLearningTrackerSnapshot(parsed) ? parsed : createEmptyLearningTrackerSnapshot();
  } catch {
    return createEmptyLearningTrackerSnapshot();
  }
}

export function loadLearningTrackerSnapshotFromStorage() {
  if (typeof window === "undefined") return createEmptyLearningTrackerSnapshot();
  return safeParseSnapshot(window.localStorage.getItem(LEARNING_TRACKER_KEY));
}

function saveLearningTrackerSnapshotToStorage(snapshot: LearningTrackerSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEARNING_TRACKER_KEY, JSON.stringify(snapshot));
}

function emitLearningTrackerChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LEARNING_TRACKER_EVENT));
}

export function recordSkillAttemptInStorage(skill: TrackedSkill, input: SkillAttemptInput) {
  const current = loadLearningTrackerSnapshotFromStorage();
  const now = new Date().toISOString();
  const currentSkill = current.skills[skill];
  const normalizedDurationSec = Number.isFinite(input.durationSec) ? Math.max(1, Math.round(input.durationSec)) : 60;

  const nextSkill: SkillProgressSnapshot = {
    attempts: currentSkill.attempts + 1,
    correct: currentSkill.correct + (input.correct ? 1 : 0),
    minutes: Number((currentSkill.minutes + normalizedDurationSec / 60).toFixed(1)),
    completed: currentSkill.completed + (input.markCompleted ? 1 : 0),
    lastUpdatedAt: now,
  };

  const nextSnapshot: LearningTrackerSnapshot = {
    ...current,
    skills: {
      ...current.skills,
      [skill]: nextSkill,
    },
  };

  saveLearningTrackerSnapshotToStorage(nextSnapshot);
  emitLearningTrackerChange();
  if (input.markCompleted) {
    if (skill === "listening") void awardBuddyXpInStorage("listeningCompletion").catch(() => undefined);
    if (skill === "speaking") void awardBuddyXpInStorage("speakingCompletion").catch(() => undefined);
    if (skill === "reading") void awardBuddyXpInStorage("readingCompletion").catch(() => undefined);
    if (skill === "writing") void awardBuddyXpInStorage("writingCompletion").catch(() => undefined);
  }
  return nextSnapshot;
}

export function clearLearningTrackerInStorage() {
  const snapshot = createEmptyLearningTrackerSnapshot();
  saveLearningTrackerSnapshotToStorage(snapshot);
  emitLearningTrackerChange();
  return snapshot;
}

export function subscribeLearningTracker(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === LEARNING_TRACKER_KEY) {
      callback();
    }
  };

  const onChanged = () => {
    callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LEARNING_TRACKER_EVENT, onChanged);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LEARNING_TRACKER_EVENT, onChanged);
  };
}
