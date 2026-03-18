export interface ReadingHistoryEntry {
  articleId: string;
  viewedAt: string;
  viewCount: number;
}

interface ReadingLibrarySnapshot {
  favoriteIds: string[];
  history: ReadingHistoryEntry[];
}

export interface ParagraphNote {
  articleId: string;
  /** "sectionIndex-paragraphIndex" */
  paragraphKey: string;
  text: string;
  updatedAt: string;
}

export const READING_FAVORITES_KEY = "english-learn:reading:favorites";
export const READING_HISTORY_KEY = "english-learn:reading:history";
export const READING_NOTES_KEY = "english-learn:reading:notes";
const READING_LIBRARY_EVENT = "english-learn:reading:changed";

const MAX_HISTORY_ITEMS = 18;
const EMPTY_READING_LIBRARY_SNAPSHOT: ReadingLibrarySnapshot = {
  favoriteIds: [],
  history: [],
};

let cachedReadingLibrarySnapshot: ReadingLibrarySnapshot = EMPTY_READING_LIBRARY_SNAPSHOT;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isHistoryArray(value: unknown): value is ReadingHistoryEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.articleId === "string" &&
        typeof item.viewedAt === "string" &&
        typeof item.viewCount === "number",
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

export function toggleFavoriteId(favoriteIds: string[], articleId: string) {
  return favoriteIds.includes(articleId)
    ? favoriteIds.filter((id) => id !== articleId)
    : [articleId, ...favoriteIds];
}

export function recordReadingHistory(
  history: ReadingHistoryEntry[],
  articleId: string,
  viewedAt = new Date().toISOString(),
) {
  const existing = history.find((entry) => entry.articleId === articleId);
  const nextEntry: ReadingHistoryEntry = existing
    ? {
        articleId,
        viewedAt,
        viewCount: existing.viewCount + 1,
      }
    : {
        articleId,
        viewedAt,
        viewCount: 1,
      };

  return [
    nextEntry,
    ...history.filter((entry) => entry.articleId !== articleId),
  ].slice(0, MAX_HISTORY_ITEMS);
}

export function loadFavoriteIdsFromStorage() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(READING_FAVORITES_KEY), [], isStringArray);
}

export function saveFavoriteIdsToStorage(favoriteIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READING_FAVORITES_KEY, JSON.stringify(favoriteIds));
}

export function loadReadingHistoryFromStorage() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(READING_HISTORY_KEY), [], isHistoryArray);
}

export function saveReadingHistoryToStorage(history: ReadingHistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(history));
}

function createReadingLibrarySnapshot(): ReadingLibrarySnapshot {
  return {
    favoriteIds: loadFavoriteIdsFromStorage(),
    history: loadReadingHistoryFromStorage(),
  };
}

function historiesMatch(left: ReadingHistoryEntry[], right: ReadingHistoryEntry[]) {
  return (
    left.length === right.length &&
    left.every(
      (entry, index) =>
        entry.articleId === right[index]?.articleId &&
        entry.viewedAt === right[index]?.viewedAt &&
        entry.viewCount === right[index]?.viewCount,
    )
  );
}

function snapshotsMatch(left: ReadingLibrarySnapshot, right: ReadingLibrarySnapshot) {
  return (
    left.favoriteIds.length === right.favoriteIds.length &&
    left.favoriteIds.every((id, index) => id === right.favoriteIds[index]) &&
    historiesMatch(left.history, right.history)
  );
}

function updateCachedSnapshot(nextSnapshot: ReadingLibrarySnapshot) {
  if (snapshotsMatch(cachedReadingLibrarySnapshot, nextSnapshot)) {
    return cachedReadingLibrarySnapshot;
  }

  cachedReadingLibrarySnapshot = nextSnapshot;
  return cachedReadingLibrarySnapshot;
}

export function getReadingLibrarySnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_READING_LIBRARY_SNAPSHOT;
  }

  return updateCachedSnapshot(createReadingLibrarySnapshot());
}

export function getReadingLibraryServerSnapshot() {
  return EMPTY_READING_LIBRARY_SNAPSHOT;
}

export function subscribeReadingLibrary(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  function handleChange() {
    updateCachedSnapshot(createReadingLibrarySnapshot());
    callback();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(READING_LIBRARY_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(READING_LIBRARY_EVENT, handleChange);
  };
}

function emitReadingLibraryChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(READING_LIBRARY_EVENT));
}

export function toggleFavoriteInStorage(articleId: string) {
  const nextFavoriteIds = toggleFavoriteId(getReadingLibrarySnapshot().favoriteIds, articleId);
  saveFavoriteIdsToStorage(nextFavoriteIds);
  updateCachedSnapshot({
    favoriteIds: nextFavoriteIds,
    history: getReadingLibrarySnapshot().history,
  });
  emitReadingLibraryChange();
  return nextFavoriteIds;
}

export function recordReadingHistoryInStorage(articleId: string, viewedAt?: string) {
  const nextHistory = recordReadingHistory(getReadingLibrarySnapshot().history, articleId, viewedAt);
  saveReadingHistoryToStorage(nextHistory);
  updateCachedSnapshot({
    favoriteIds: getReadingLibrarySnapshot().favoriteIds,
    history: nextHistory,
  });
  emitReadingLibraryChange();
  return nextHistory;
}

/* ── Paragraph notes ─────────────────────────────────────────────── */

function isNoteArray(value: unknown): value is ParagraphNote[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.articleId === "string" &&
        typeof item.paragraphKey === "string" &&
        typeof item.text === "string" &&
        typeof item.updatedAt === "string",
    )
  );
}

export function loadNotesFromStorage(): ParagraphNote[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(READING_NOTES_KEY), [], isNoteArray);
}

export function getNotesForArticle(articleId: string): ParagraphNote[] {
  return loadNotesFromStorage().filter((note) => note.articleId === articleId);
}

export function saveNoteForParagraph(articleId: string, paragraphKey: string, text: string) {
  const allNotes = loadNotesFromStorage();
  const trimmed = text.trim();

  // Remove if empty
  if (!trimmed) {
    const filtered = allNotes.filter(
      (n) => !(n.articleId === articleId && n.paragraphKey === paragraphKey),
    );
    if (typeof window !== "undefined") {
      window.localStorage.setItem(READING_NOTES_KEY, JSON.stringify(filtered));
    }
    emitReadingLibraryChange();
    return;
  }

  const existing = allNotes.findIndex(
    (n) => n.articleId === articleId && n.paragraphKey === paragraphKey,
  );

  const note: ParagraphNote = {
    articleId,
    paragraphKey,
    text: trimmed,
    updatedAt: new Date().toISOString(),
  };

  if (existing >= 0) {
    allNotes[existing] = note;
  } else {
    allNotes.push(note);
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(READING_NOTES_KEY, JSON.stringify(allNotes));
  }
  emitReadingLibraryChange();
}
