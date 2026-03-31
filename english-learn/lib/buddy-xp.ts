import {
  type BuddyXpAwardSource,
  BUDDY_XP_RULES,
} from "@/lib/buddy-xp-config";
import { dispatchBuddyXpEvent } from "@/lib/buddy-xp-events";

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

const BUDDY_PROGRESS_CACHE_KEY = "english-learn:buddy-progress-cache";
const BUDDY_PROGRESS_EVENT = "english-learn:buddy-progress:changed";
const AUTH_USER_ID_STORAGE_KEY = "demo_auth_user_id";
const AUTH_PROVIDER_STORAGE_KEY = "demo_auth_provider";

function getBuddyProgressCacheKey() {
  if (typeof window === "undefined") return BUDDY_PROGRESS_CACHE_KEY;
  const authProvider = window.localStorage.getItem(AUTH_PROVIDER_STORAGE_KEY)?.trim() || "guest";
  const authUserId = window.localStorage.getItem(AUTH_USER_ID_STORAGE_KEY)?.trim() || "guest";
  return `${BUDDY_PROGRESS_CACHE_KEY}:${authProvider}:${authUserId}`;
}

function createEmptyBuddyXpSummary(): BuddyXpSummary {
  return {
    totalXp: 0,
    totalCompletedSources: 0,
    counts: {
      listeningCompletions: 0,
      speakingCompletions: 0,
      readingCompletions: 0,
      writingCompletions: 0,
      reviewSessions: 0,
      escapeRoomClears: 0,
      dormLockoutClears: 0,
      lastTrainClears: 0,
    },
  };
}

function normalizeSummary(value: unknown): BuddyXpSummary {
  if (!value || typeof value !== "object") {
    return createEmptyBuddyXpSummary();
  }

  const counts = (value as { counts?: Partial<BuddyXpSourceCounts> }).counts ?? {};
  const normalizedCounts: BuddyXpSourceCounts = {
    listeningCompletions: Math.max(0, Math.floor(counts.listeningCompletions ?? 0)),
    speakingCompletions: Math.max(0, Math.floor(counts.speakingCompletions ?? 0)),
    readingCompletions: Math.max(0, Math.floor(counts.readingCompletions ?? 0)),
    writingCompletions: Math.max(0, Math.floor(counts.writingCompletions ?? 0)),
    reviewSessions: Math.max(0, Math.floor(counts.reviewSessions ?? 0)),
    escapeRoomClears: Math.max(0, Math.floor(counts.escapeRoomClears ?? 0)),
    dormLockoutClears: Math.max(0, Math.floor(counts.dormLockoutClears ?? 0)),
    lastTrainClears: Math.max(0, Math.floor(counts.lastTrainClears ?? 0)),
  };

  return {
    totalXp: Math.max(
      0,
      Math.floor(
        typeof (value as { totalXp?: number }).totalXp === "number"
          ? (value as { totalXp?: number }).totalXp ?? 0
          : 0
      )
    ),
    totalCompletedSources: Math.max(
      0,
      Math.floor(
        typeof (value as { totalCompletedSources?: number }).totalCompletedSources === "number"
          ? (value as { totalCompletedSources?: number }).totalCompletedSources ?? 0
          : 0
      )
    ),
    counts: normalizedCounts,
  };
}

function saveBuddyXpSummaryToStorage(summary: BuddyXpSummary) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getBuddyProgressCacheKey(), JSON.stringify(summary));
}

function emitBuddyXpSummaryChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BUDDY_PROGRESS_EVENT));
}

export function getBuddyXpSummaryFromStorage(): BuddyXpSummary {
  if (typeof window === "undefined") return createEmptyBuddyXpSummary();

  const raw = window.localStorage.getItem(getBuddyProgressCacheKey());
  if (!raw) return createEmptyBuddyXpSummary();

  try {
    return normalizeSummary(JSON.parse(raw));
  } catch {
    return createEmptyBuddyXpSummary();
  }
}

export async function fetchBuddyXpSummary() {
  if (typeof window === "undefined") {
    return createEmptyBuddyXpSummary();
  }

  let response: Response;

  try {
    response = await fetch("/api/buddy/progress", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    const cached = getBuddyXpSummaryFromStorage();
    saveBuddyXpSummaryToStorage(cached);
    emitBuddyXpSummaryChange();
    return cached;
  }

  if (!response.ok) {
    if (response.status === 401) {
      const empty = createEmptyBuddyXpSummary();
      saveBuddyXpSummaryToStorage(empty);
      emitBuddyXpSummaryChange();
      return empty;
    }

    throw new Error("Failed to load buddy progress");
  }

  const payload = (await response.json()) as {
    progress?: Partial<BuddyXpSummary>;
  };

  const summary = normalizeSummary(payload.progress);
  saveBuddyXpSummaryToStorage(summary);
  emitBuddyXpSummaryChange();
  return summary;
}

export async function awardBuddyXpInStorage(source: BuddyXpAwardSource) {
  if (typeof window === "undefined") {
    return createEmptyBuddyXpSummary();
  }

  const response = await fetch("/api/buddy/progress", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "award",
      source,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to award buddy XP");
  }

  const payload = (await response.json()) as {
    progress?: Partial<BuddyXpSummary>;
  };

  const summary = normalizeSummary(payload.progress);
  saveBuddyXpSummaryToStorage(summary);
  emitBuddyXpSummaryChange();
  dispatchBuddyXpEvent({
    id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    xp: BUDDY_XP_RULES[source],
    createdAt: new Date().toISOString(),
  });
  return summary;
}

export async function resetBuddyXpInStorage() {
  if (typeof window === "undefined") {
    return createEmptyBuddyXpSummary();
  }

  const response = await fetch("/api/buddy/progress", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "reset",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to reset buddy XP");
  }

  const payload = (await response.json()) as {
    progress?: Partial<BuddyXpSummary>;
  };

  const summary = normalizeSummary(payload.progress);
  saveBuddyXpSummaryToStorage(summary);
  emitBuddyXpSummaryChange();
  return summary;
}

export function subscribeBuddyXpSources(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === getBuddyProgressCacheKey()) {
      callback();
    }
  };

  const onChanged = () => {
    callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BUDDY_PROGRESS_EVENT, onChanged);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BUDDY_PROGRESS_EVENT, onChanged);
  };
}
