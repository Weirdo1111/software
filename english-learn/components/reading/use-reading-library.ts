"use client";

import { useSyncExternalStore } from "react";

import {
  getReadingLibraryServerSnapshot,
  getReadingLibrarySnapshot,
  recordReadingHistoryInStorage,
  subscribeReadingLibrary,
  toggleFavoriteInStorage,
} from "@/lib/reading-library";

export function useReadingLibrary() {
  const snapshot = useSyncExternalStore(
    subscribeReadingLibrary,
    getReadingLibrarySnapshot,
    getReadingLibraryServerSnapshot,
  );

  return {
    favoriteIds: snapshot.favoriteIds,
    history: snapshot.history,
    hydrated: true,
    toggleFavorite: toggleFavoriteInStorage,
    pushHistory: recordReadingHistoryInStorage,
  };
}
