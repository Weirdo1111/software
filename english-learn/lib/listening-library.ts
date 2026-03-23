export interface ListeningHistoryEntry {
  groupId: string;
  viewedAt: string;
  viewCount: number;
}

export interface ListeningCompletionEntry {
  groupId: string;
  completedAt: string;
  attempts: number;
  bestScore: number;
  passed: boolean;
}

interface ListeningLibrarySnapshot {
  favoriteGroupIds: string[];
  history: ListeningHistoryEntry[];
  completions: ListeningCompletionEntry[];
}

export const LISTENING_FAVORITES_KEY = "english-learn:listening:favorites";
export const LISTENING_HISTORY_KEY = "english-learn:listening:history";
export const LISTENING_COMPLETIONS_KEY = "english-learn:listening:completions";
const LISTENING_LIBRARY_EVENT = "english-learn:listening:changed";

const MAX_HISTORY_ITEMS = 18;

const EMPTY_LISTENING_LIBRARY_SNAPSHOT: ListeningLibrarySnapshot = {
  favoriteGroupIds: [],
  history: [],
  completions: [],
};

let cachedListeningLibrarySnapshot: ListeningLibrarySnapshot = EMPTY_LISTENING_LIBRARY_SNAPSHOT;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isHistoryArray(value: unknown): value is ListeningHistoryEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.groupId === "string" &&
        typeof item.viewedAt === "string" &&
        typeof item.viewCount === "number",
    )
  );
}

function isCompletionArray(value: unknown): value is ListeningCompletionEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.groupId === "string" &&
        typeof item.completedAt === "string" &&
        typeof item.attempts === "number" &&
        typeof item.bestScore === "number" &&
        typeof item.passed === "boolean",
    )
  );
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

export function toggleFavoriteGroupId(favoriteGroupIds: string[], groupId: string) {
  return favoriteGroupIds.includes(groupId)
    ? favoriteGroupIds.filter((id) => id !== groupId)
    : [groupId, ...favoriteGroupIds];
}

export function recordListeningHistory(
  history: ListeningHistoryEntry[],
  groupId: string,
  viewedAt = new Date().toISOString(),
) {
  const existing = history.find((entry) => entry.groupId === groupId);
  const nextEntry: ListeningHistoryEntry = existing
    ? {
        groupId,
        viewedAt,
        viewCount: existing.viewCount + 1,
      }
    : {
        groupId,
        viewedAt,
        viewCount: 1,
      };

  return [nextEntry, ...history.filter((entry) => entry.groupId !== groupId)].slice(0, MAX_HISTORY_ITEMS);
}

export function recordListeningCompletion(
  completions: ListeningCompletionEntry[],
  groupId: string,
  score: number,
  passed: boolean,
  completedAt = new Date().toISOString(),
) {
  const existing = completions.find((entry) => entry.groupId === groupId);
  const nextEntry: ListeningCompletionEntry = existing
    ? {
        groupId,
        completedAt,
        attempts: existing.attempts + 1,
        bestScore: Math.max(existing.bestScore, score),
        passed: existing.passed || passed,
      }
    : {
        groupId,
        completedAt,
        attempts: 1,
        bestScore: score,
        passed,
      };

  return [
    nextEntry,
    ...completions.filter((entry) => entry.groupId !== groupId),
  ];
}

function loadFavoriteGroupIdsFromStorage() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(LISTENING_FAVORITES_KEY), [], isStringArray);
}

function saveFavoriteGroupIdsToStorage(favoriteGroupIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LISTENING_FAVORITES_KEY, JSON.stringify(favoriteGroupIds));
}

function loadListeningHistoryFromStorage() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(LISTENING_HISTORY_KEY), [], isHistoryArray);
}

function saveListeningHistoryToStorage(history: ListeningHistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LISTENING_HISTORY_KEY, JSON.stringify(history));
}

function loadListeningCompletionsFromStorage() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(LISTENING_COMPLETIONS_KEY), [], isCompletionArray);
}

function saveListeningCompletionsToStorage(completions: ListeningCompletionEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LISTENING_COMPLETIONS_KEY, JSON.stringify(completions));
}

function createListeningLibrarySnapshot(): ListeningLibrarySnapshot {
  return {
    favoriteGroupIds: loadFavoriteGroupIdsFromStorage(),
    history: loadListeningHistoryFromStorage(),
    completions: loadListeningCompletionsFromStorage(),
  };
}

function historiesMatch(left: ListeningHistoryEntry[], right: ListeningHistoryEntry[]) {
  return (
    left.length === right.length &&
    left.every(
      (entry, index) =>
        entry.groupId === right[index]?.groupId &&
        entry.viewedAt === right[index]?.viewedAt &&
        entry.viewCount === right[index]?.viewCount,
    )
  );
}

function completionsMatch(left: ListeningCompletionEntry[], right: ListeningCompletionEntry[]) {
  return (
    left.length === right.length &&
    left.every(
      (entry, index) =>
        entry.groupId === right[index]?.groupId &&
        entry.completedAt === right[index]?.completedAt &&
        entry.attempts === right[index]?.attempts &&
        entry.bestScore === right[index]?.bestScore &&
        entry.passed === right[index]?.passed,
    )
  );
}

function snapshotsMatch(left: ListeningLibrarySnapshot, right: ListeningLibrarySnapshot) {
  return (
    left.favoriteGroupIds.length === right.favoriteGroupIds.length &&
    left.favoriteGroupIds.every((id, index) => id === right.favoriteGroupIds[index]) &&
    historiesMatch(left.history, right.history) &&
    completionsMatch(left.completions, right.completions)
  );
}

function updateCachedSnapshot(nextSnapshot: ListeningLibrarySnapshot) {
  if (snapshotsMatch(cachedListeningLibrarySnapshot, nextSnapshot)) {
    return cachedListeningLibrarySnapshot;
  }

  cachedListeningLibrarySnapshot = nextSnapshot;
  return cachedListeningLibrarySnapshot;
}

export function getListeningLibrarySnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_LISTENING_LIBRARY_SNAPSHOT;
  }

  return updateCachedSnapshot(createListeningLibrarySnapshot());
}

export function getListeningLibraryServerSnapshot() {
  return EMPTY_LISTENING_LIBRARY_SNAPSHOT;
}

export function subscribeListeningLibrary(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  function handleChange() {
    updateCachedSnapshot(createListeningLibrarySnapshot());
    callback();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(LISTENING_LIBRARY_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LISTENING_LIBRARY_EVENT, handleChange);
  };
}

function emitListeningLibraryChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LISTENING_LIBRARY_EVENT));
}

export function toggleListeningFavoriteInStorage(groupId: string) {
  const snapshot = getListeningLibrarySnapshot();
  const nextFavoriteGroupIds = toggleFavoriteGroupId(snapshot.favoriteGroupIds, groupId);
  saveFavoriteGroupIdsToStorage(nextFavoriteGroupIds);
  updateCachedSnapshot({
    favoriteGroupIds: nextFavoriteGroupIds,
    history: snapshot.history,
    completions: snapshot.completions,
  });
  emitListeningLibraryChange();
  return nextFavoriteGroupIds;
}

export function recordListeningHistoryInStorage(groupId: string, viewedAt?: string) {
  const snapshot = getListeningLibrarySnapshot();
  const nextHistory = recordListeningHistory(snapshot.history, groupId, viewedAt);
  saveListeningHistoryToStorage(nextHistory);
  updateCachedSnapshot({
    favoriteGroupIds: snapshot.favoriteGroupIds,
    history: nextHistory,
    completions: snapshot.completions,
  });
  emitListeningLibraryChange();
  return nextHistory;
}

export function recordListeningCompletionInStorage(
  groupId: string,
  score: number,
  passed: boolean,
  completedAt?: string,
) {
  const snapshot = getListeningLibrarySnapshot();
  const nextCompletions = recordListeningCompletion(
    snapshot.completions,
    groupId,
    score,
    passed,
    completedAt,
  );
  saveListeningCompletionsToStorage(nextCompletions);
  updateCachedSnapshot({
    favoriteGroupIds: snapshot.favoriteGroupIds,
    history: snapshot.history,
    completions: nextCompletions,
  });
  emitListeningLibraryChange();
  return nextCompletions;
}
