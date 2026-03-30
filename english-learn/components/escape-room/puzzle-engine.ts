import { QUEST_REWARD } from "@/components/escape-room/room-data";
import type { ClueItem, GamePhase, GameProgress, InventoryItem, InventoryState, PuzzleId, RoomObjectId, RoomObjectState } from "@/components/escape-room/types";

export type GameAction =
  | { type: "START_GAME" }
  | { type: "COLLECT_NOTICE_BOARD"; clue: ClueItem; note: string }
  | { type: "COLLECT_RETURN_CART"; clue: ClueItem; item: InventoryItem; note: string }
  | { type: "COLLECT_BOOKSHELF"; clue: ClueItem; item: InventoryItem; note: string }
  | { type: "COMPLETE_DESK"; item: InventoryItem; note: string; usedItemId: string }
  | { type: "COMPLETE_AUDIO"; note: string }
  | { type: "COLLECT_FLOOR_MAP"; clue: ClueItem; note: string }
  | { type: "SET_PROGRESS"; progress: GameProgress };

const defaultPuzzles: Record<PuzzleId, boolean> = {
  "notice-board": false,
  "return-cart": false,
  bookshelf: false,
  "circulation-desk": false,
  speaker: false,
  "floor-map": false,
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

function addUniqueItem(inventory: InventoryState, item: InventoryItem): InventoryState {
  if (inventory.items.some((entry) => entry.id === item.id)) {
    return inventory;
  }

  return {
    ...inventory,
    items: [...inventory.items, item],
  };
}

function markItemUsed(inventory: InventoryState, itemId: string): InventoryState {
  return {
    ...inventory,
    items: inventory.items.map((item) => (item.id === itemId ? { ...item, used: true } : item)),
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

export function hasItem(progress: GameProgress, itemId: string): boolean {
  return progress.inventory.items.some((item) => item.id === itemId);
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

export function createInitialGameProgress(): GameProgress {
  return {
    started: false,
    phase: "intro",
    currentObjective: "Start the run and inspect the notice board for the first real closing clue.",
    completedPuzzles: { ...defaultPuzzles },
    inventory: {
      clues: [],
      items: [],
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

export function collectNoticeBoardClue(progress: GameProgress, clue: ClueItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "notice-board": true,
    },
    inventory: addUniqueNote(addUniqueClue(progress.inventory, clue), note),
  });
}

export function collectReturnCartLead(progress: GameProgress, clue: ClueItem, item: InventoryItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "return-cart": true,
    },
    inventory: addUniqueNote(addUniqueItem(addUniqueClue(progress.inventory, clue), item), note),
  });
}

export function collectBookshelfClue(progress: GameProgress, clue: ClueItem, item: InventoryItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      bookshelf: true,
    },
    inventory: addUniqueNote(addUniqueItem(addUniqueClue(progress.inventory, clue), item), note),
  });
}

export function completeDeskPuzzle(progress: GameProgress, item: InventoryItem, note: string, usedItemId: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "circulation-desk": true,
    },
    inventory: addUniqueNote(addUniqueItem(markItemUsed(progress.inventory, usedItemId), item), note),
  });
}

export function completeAudioPuzzle(progress: GameProgress, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      speaker: true,
    },
    inventory: addUniqueNote(progress.inventory, note),
  });
}

export function collectFloorMapClue(progress: GameProgress, clue: ClueItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "floor-map": true,
    },
    inventory: addUniqueNote(addUniqueClue(progress.inventory, clue), note),
  });
}

export function getCompletionCount(progress: GameProgress): number {
  return Object.values(progress.completedPuzzles).filter(Boolean).length;
}

export function getCompletionPercent(progress: GameProgress): number {
  return Math.round((getCompletionCount(progress) / Object.keys(defaultPuzzles).length) * 100);
}

export function canUnlockDoor(progress: GameProgress): boolean {
  return Object.values(progress.completedPuzzles).every(Boolean);
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

  if (progress.completedPuzzles.speaker) {
    return "audio-complete";
  }

  if (progress.completedPuzzles["circulation-desk"]) {
    return "desk-opened";
  }

  if (progress.completedPuzzles.bookshelf) {
    return "shelf-found";
  }

  if (progress.completedPuzzles["return-cart"]) {
    return "cart-found";
  }

  return "exploring";
}

export function getCurrentObjective(progress: GameProgress): string {
  if (progress.reward.escaped) {
    return "Quest completed. Review the reward screen or restart the library run.";
  }

  if (!progress.started) {
    return "Start the quest to activate the library floor investigation.";
  }

  if (!progress.completedPuzzles["notice-board"]) {
    return "Inspect the notice board and record the real closing time from the late-night memo.";
  }

  if (!progress.completedPuzzles["return-cart"]) {
    return "Search the return cart and recover the reshelving slip that points to the correct section.";
  }

  if (!progress.completedPuzzles.bookshelf) {
    return "Use the cart slip in the history stacks, record the shelf code, and recover the desk key.";
  }

  if (!progress.completedPuzzles["circulation-desk"]) {
    return "Unlock the circulation drawer and log the after-hours procedure card.";
  }

  if (!progress.completedPuzzles.speaker) {
    return "Listen to the overhead speaker and confirm which clue must come second.";
  }

  if (!progress.completedPuzzles["floor-map"]) {
    return "Verify the keypad format on the floor map before attempting the exit console.";
  }

  return "Move to the exit console and enter the full 6-digit code.";
}

export function getObjectState(progress: GameProgress, objectId: RoomObjectId): RoomObjectState {
  const cleared =
    objectId === "exit-door"
      ? progress.reward.escaped
      : progress.completedPuzzles[objectId as PuzzleId];

  if (cleared) {
    return "cleared";
  }

  if (!progress.started) {
    return objectId === "exit-door" ? "available" : "locked";
  }

  switch (objectId) {
    case "notice-board":
      return "available";
    case "return-cart":
      return progress.completedPuzzles["notice-board"] ? "available" : "locked";
    case "bookshelf":
      return progress.completedPuzzles["return-cart"] ? "available" : "locked";
    case "circulation-desk":
      return progress.completedPuzzles.bookshelf && hasItem(progress, "desk-key") ? "available" : "locked";
    case "speaker":
      return progress.completedPuzzles["circulation-desk"] ? "available" : "locked";
    case "floor-map":
      return progress.completedPuzzles.speaker ? "available" : "locked";
    case "exit-door":
      return "available";
  }
}

export function startQuest(progress: GameProgress): GameProgress {
  return syncProgress({
    ...progress,
    started: true,
  });
}

export interface DoorAttemptResult {
  nextProgress: GameProgress;
  success: boolean;
  message: string;
}

export function getUnlockBlockerMessage(progress: GameProgress): string {
  if (canUnlockDoor(progress)) {
    return "The exit is ready. Enter the 6-digit code.";
  }

  return `You are not done yet. ${getCurrentObjective(progress)}`;
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
      message: "That sequence still does not match the desk card, PA order, and keypad format.",
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
    message: "The emergency exit unlocks. You escaped the library.",
  };
}

export function escapeRoomReducer(progress: GameProgress, action: GameAction): GameProgress {
  switch (action.type) {
    case "START_GAME":
      return startQuest(progress);
    case "COLLECT_NOTICE_BOARD":
      return collectNoticeBoardClue(progress, action.clue, action.note);
    case "COLLECT_RETURN_CART":
      return collectReturnCartLead(progress, action.clue, action.item, action.note);
    case "COLLECT_BOOKSHELF":
      return collectBookshelfClue(progress, action.clue, action.item, action.note);
    case "COMPLETE_DESK":
      return completeDeskPuzzle(progress, action.item, action.note, action.usedItemId);
    case "COMPLETE_AUDIO":
      return completeAudioPuzzle(progress, action.note);
    case "COLLECT_FLOOR_MAP":
      return collectFloorMapClue(progress, action.clue, action.note);
    case "SET_PROGRESS":
      return syncProgress(action.progress);
    default:
      return progress;
  }
}
