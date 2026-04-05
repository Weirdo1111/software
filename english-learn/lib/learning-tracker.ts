import { awardBuddyXpInStorage } from "@/lib/buddy-xp";
import { emitBuddyPageEvent } from "@/lib/buddy-page-events";

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
    emitCompletionBuddyEvent(skill, input.correct);
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

function emitCompletionBuddyEvent(skill: TrackedSkill, correct: boolean) {
  if (skill === "listening") {
    emitBuddyPageEvent({
      text: correct
        ? { zh: "\u542c\u529b\u5b8c\u6210\uff0c\u6211\u542c\u89c1\u8fdb\u6b65\u4e86", en: "Listening done. I can hear the progress." }
        : { zh: "\u542c\u5b8c\u4e00\u8f6e\u4e86\uff0c\u6211\u4eec\u518d\u7ec3\u4e00\u6b21", en: "One listening round down. We can try again." },
      reaction: correct ? "bounce" : "blink",
      face: correct ? "open" : "blink",
      sound: correct ? "bounce" : "click",
    });
    return;
  }

  if (skill === "speaking") {
    emitBuddyPageEvent({
      text: correct
        ? { zh: "\u53e3\u8bed\u63d0\u4ea4\u6210\u529f\uff0c\u8fd9\u6b21\u5f88\u6562\u5f00\u53e3", en: "Speaking submitted. That was a brave turn." }
        : { zh: "\u53e3\u8bed\u7ec3\u4e86\u4e00\u8f6e\uff0c\u518d\u4fee\u4e00\u4e0b\u4f1a\u66f4\u7a33", en: "A speaking round is in. One revision will make it steadier." },
      reaction: correct ? "wave" : "blink",
      face: correct ? "open" : "happy",
      sound: correct ? "wave" : "click",
    });
    return;
  }

  if (skill === "reading") {
    emitBuddyPageEvent({
      text: correct
        ? { zh: "\u9605\u8bfb\u7406\u89e3\u8fc7\u5173\uff0c\u5173\u952e\u4fe1\u606f\u6293\u4f4f\u4e86", en: "Reading check cleared. You caught the key points." }
        : { zh: "\u9605\u8bfb\u9898\u5df2\u5b8c\u6210\uff0c\u56de\u5934\u518d\u5bf9\u4e00\u904d\u8bc1\u636e", en: "Reading done. Let's revisit the evidence once more." },
      reaction: correct ? "bounce" : "blink",
      face: correct ? "open" : "happy",
      sound: correct ? "bounce" : "click",
    });
    return;
  }

  emitBuddyPageEvent({
    text: correct
      ? { zh: "\u5199\u4f5c\u53cd\u9988\u5230\u624b\uff0c\u8fd9\u6bb5\u8d8a\u6765\u8d8a\u50cf\u6837\u4e86", en: "Writing feedback is in. This draft is taking shape." }
      : { zh: "\u5199\u4f5c\u8349\u7a3f\u5df2\u63d0\u4ea4\uff0c\u6211\u4eec\u4e00\u8d77\u6253\u78e8\u4e0b\u4e00\u7248", en: "Draft submitted. We can polish the next version together." },
    reaction: correct ? "wave" : "blink",
    face: correct ? "happy" : "blink",
    sound: correct ? "wave" : "click",
  });
}
