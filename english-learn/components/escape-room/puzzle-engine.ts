import { QUEST_REWARD } from "@/components/escape-room/room-data";
import type { ClueItem, GamePhase, GameProgress, InventoryState, PuzzleId } from "@/components/escape-room/types";

export type GameAction =
  | { type: "START_GAME" }
  | { type: "COLLECT_NOTICE_BOARD"; clue: ClueItem }
  | { type: "COLLECT_BOOKSHELF"; clue: ClueItem }
  | { type: "RECORD_INTEL"; clue?: ClueItem; note?: string }
  | { type: "COMPLETE_AUDIO"; note: string }
  | { type: "COMPLETE_DIALOGUE"; note: string }
  | { type: "COMPLETE_QUIZ"; note: string }
  | { type: "SET_PROGRESS"; progress: GameProgress };

const defaultPuzzles: Record<PuzzleId, boolean> = {
  "notice-board": false,
  bookshelf: false,
  speaker: false,
  "librarian-desk-terminal": false,
  quiz: false,
};

function addUniqueClue(inventory: InventoryState, clue: ClueItem): InventoryState {
  if (inventory.clues.some((entry) => entry.id === clue.id)) {
    return inventory;
  }

  return {
    ...inventory,
    clues: [...inventory.clues, clue],
  };
}

function addUniqueNote(inventory: InventoryState, note: string): InventoryState {
  if (inventory.notes.includes(note)) {
    return inventory;
  }

  return {
    ...inventory,
    notes: [...inventory.notes, note],
  };
}

export function createInitialGameProgress(): GameProgress {
  return {
    started: false,
    phase: "intro",
    currentObjective: "Start the quest and search the library for your first clue.",
    completedPuzzles: { ...defaultPuzzles },
    inventory: {
      clues: [],
      notes: [],
    },
    reward: {
      xpEarned: 0,
      badgeUnlocked: null,
      escaped: false,
    },
    keypadAttempts: 0,
  };
}

export function addClue(progress: GameProgress, puzzleId: Extract<PuzzleId, "notice-board" | "bookshelf">, clue: ClueItem): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      [puzzleId]: true,
    },
    inventory: addUniqueClue(progress.inventory, clue),
  });
}

export function completePuzzle(progress: GameProgress, puzzleId: Exclude<PuzzleId, "notice-board" | "bookshelf">, note?: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      [puzzleId]: true,
    },
    inventory: note ? addUniqueNote(progress.inventory, note) : progress.inventory,
  });
}

export function recordIntel(progress: GameProgress, clue?: ClueItem, note?: string): GameProgress {
  return syncProgress({
    ...progress,
    inventory: {
      clues: clue && !progress.inventory.clues.some((entry) => entry.id === clue.id) ? [...progress.inventory.clues, clue] : progress.inventory.clues,
      notes: note && !progress.inventory.notes.includes(note) ? [...progress.inventory.notes, note] : progress.inventory.notes,
    },
  });
}

export function getCompletionCount(progress: GameProgress): number {
  return Object.values(progress.completedPuzzles).filter(Boolean).length;
}

export function getCompletionPercent(progress: GameProgress): number {
  return Math.round((getCompletionCount(progress) / Object.keys(defaultPuzzles).length) * 100);
}

export function hasRequiredIntel(progress: GameProgress): boolean {
  return progress.inventory.clues.some((clue) => clue.source === "floor-map" || clue.source === "return-cart");
}

export function canUnlockDoor(progress: GameProgress): boolean {
  return Object.values(progress.completedPuzzles).every(Boolean) && hasRequiredIntel(progress);
}

export function isReadyToUnlock(progress: GameProgress): boolean {
  return canUnlockDoor(progress);
}

export function validateCode(code: string, expectedCode: string): boolean {
  return code.replace(/\s+/g, "") === expectedCode;
}

export function derivePhase(progress: GameProgress): GamePhase {
  if (progress.reward.escaped) {
    return "escaped";
  }

  if (!progress.started) {
    return "intro";
  }

  if (canUnlockDoor(progress)) {
    return "ready-to-unlock";
  }

  if (progress.completedPuzzles.quiz) {
    return "quiz-complete";
  }

  if (progress.completedPuzzles["librarian-desk-terminal"]) {
    return "dialogue-complete";
  }

  if (progress.completedPuzzles.speaker) {
    return "audio-complete";
  }

  return "exploring";
}

export function getCurrentObjective(progress: GameProgress): string {
  if (progress.reward.escaped) {
    return "Quest completed. Review your reward or replay the library run.";
  }

  if (!progress.started) {
    return "Start the quest to activate the library hotspots.";
  }

  if (!progress.completedPuzzles["notice-board"]) {
    return "Read the notice board and identify the real library closing notice.";
  }

  if (!progress.completedPuzzles.bookshelf) {
    return "Inspect the library stacks and find the campus history shelf number.";
  }

  if (!progress.completedPuzzles.speaker) {
    return "Listen to the announcement and verify the code order.";
  }

  if (!progress.completedPuzzles["librarian-desk-terminal"]) {
    return "Ask the librarian desk politely for help with the order.";
  }

  if (!progress.completedPuzzles.quiz) {
    return "Pass the library etiquette quiz to unlock the exit keypad.";
  }

  if (!hasRequiredIntel(progress)) {
    return "Inspect the floor map or return cart before using the keypad. The final code format is hidden in the desk-side intel.";
  }

  return "Open the exit keypad and enter the full library code.";
}

function syncProgress(progress: GameProgress): GameProgress {
  const nextPhase = derivePhase(progress);

  return {
    ...progress,
    phase: nextPhase,
    currentObjective: getCurrentObjective({
      ...progress,
      phase: nextPhase,
    }),
  };
}

export function startQuest(progress: GameProgress): GameProgress {
  return syncProgress({
    ...progress,
    started: true,
  });
}

export function collectNoticeBoardClue(progress: GameProgress, clue: ClueItem): GameProgress {
  return addClue(progress, "notice-board", clue);
}

export function collectBookshelfClue(progress: GameProgress, clue: ClueItem): GameProgress {
  return addClue(progress, "bookshelf", clue);
}

export function completeAudioPuzzle(progress: GameProgress, note: string): GameProgress {
  return completePuzzle(progress, "speaker", note);
}

export function completeDialoguePuzzle(progress: GameProgress, note: string): GameProgress {
  return completePuzzle(progress, "librarian-desk-terminal", note);
}

export function completeChoiceQuiz(progress: GameProgress, note: string): GameProgress {
  return completePuzzle(progress, "quiz", note);
}

export interface DoorAttemptResult {
  nextProgress: GameProgress;
  success: boolean;
  message: string;
}

export function getUnlockBlockerMessage(progress: GameProgress): string {
  if (!Object.values(progress.completedPuzzles).every(Boolean)) {
    return "You still need more clues before unlocking the exit.";
  }

  if (!hasRequiredIntel(progress)) {
    return "Inspect the floor map or return cart before unlocking the exit.";
  }

  return "You still need more clues before unlocking the exit.";
}

export function tryUnlockDoor(progress: GameProgress, code: string, expectedCode: string): DoorAttemptResult {
  const nextAttemptState = syncProgress({
    ...progress,
    keypadAttempts: progress.keypadAttempts + 1,
  });

  if (!canUnlockDoor(progress)) {
    return {
      nextProgress: nextAttemptState,
      success: false,
      message: getUnlockBlockerMessage(progress),
    };
  }

  if (!validateCode(code, expectedCode)) {
    return {
      nextProgress: nextAttemptState,
      success: false,
      message: "That code does not match the library clues yet.",
    };
  }

  return {
    nextProgress: syncProgress({
      ...nextAttemptState,
      reward: {
        xpEarned: QUEST_REWARD.xpEarned,
        badgeUnlocked: QUEST_REWARD.badgeUnlocked,
        escaped: true,
      },
    }),
    success: true,
    message: "The exit unlocks. You escaped the library!",
  };
}

export function escapeRoomReducer(progress: GameProgress, action: GameAction): GameProgress {
  switch (action.type) {
    case "START_GAME":
      return startQuest(progress);
    case "COLLECT_NOTICE_BOARD":
      return collectNoticeBoardClue(progress, action.clue);
    case "COLLECT_BOOKSHELF":
      return collectBookshelfClue(progress, action.clue);
    case "RECORD_INTEL":
      return recordIntel(progress, action.clue, action.note);
    case "COMPLETE_AUDIO":
      return completeAudioPuzzle(progress, action.note);
    case "COMPLETE_DIALOGUE":
      return completeDialoguePuzzle(progress, action.note);
    case "COMPLETE_QUIZ":
      return completeChoiceQuiz(progress, action.note);
    case "SET_PROGRESS":
      return syncProgress(action.progress);
    default:
      return progress;
  }
}
