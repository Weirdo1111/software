import { DORM_REWARD } from "@/components/dorm-lockout/dorm-data";
import type { ClueItem, GamePhase, GameProgress, InventoryItem, InventoryState, PuzzleId, RoomObjectId, RoomObjectState } from "@/components/escape-room/types";

export type DormGameAction =
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

export function dormHasItem(progress: GameProgress, itemId: string): boolean {
  return progress.inventory.items.some((item) => item.id === itemId);
}

function syncProgress(progress: GameProgress): GameProgress {
  const nextPhase = deriveDormPhase(progress);

  return {
    ...progress,
    phase: nextPhase,
    currentObjective: getDormCurrentObjective({
      ...progress,
      phase: nextPhase,
    }),
  };
}

export function createInitialDormProgress(): GameProgress {
  return {
    started: false,
    phase: "intro",
    currentObjective: "Start the run and inspect the dorm notice board for the first after-hours clue.",
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

export function collectDormNoticeClue(progress: GameProgress, clue: ClueItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "notice-board": true,
    },
    inventory: addUniqueNote(addUniqueClue(progress.inventory, clue), note),
  });
}

export function collectDormCubbyClue(progress: GameProgress, clue: ClueItem, item: InventoryItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "return-cart": true,
    },
    inventory: addUniqueNote(addUniqueItem(addUniqueClue(progress.inventory, clue), item), note),
  });
}

export function collectDormBackpackLead(progress: GameProgress, clue: ClueItem, item: InventoryItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      bookshelf: true,
    },
    inventory: addUniqueNote(addUniqueItem(addUniqueClue(progress.inventory, clue), item), note),
  });
}

export function completeDormDeskPuzzle(progress: GameProgress, item: InventoryItem, note: string, usedItemId: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "circulation-desk": true,
    },
    inventory: addUniqueNote(addUniqueItem(markItemUsed(progress.inventory, usedItemId), item), note),
  });
}

export function completeDormAudioPuzzle(progress: GameProgress, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      speaker: true,
    },
    inventory: addUniqueNote(progress.inventory, note),
  });
}

export function collectDormHandbookClue(progress: GameProgress, clue: ClueItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "floor-map": true,
    },
    inventory: addUniqueNote(addUniqueClue(progress.inventory, clue), note),
  });
}

export function getDormCompletionCount(progress: GameProgress): number {
  return Object.values(progress.completedPuzzles).filter(Boolean).length;
}

export function getDormCompletionPercent(progress: GameProgress): number {
  return Math.round((getDormCompletionCount(progress) / Object.keys(defaultPuzzles).length) * 100);
}

export function canUnlockDormDoor(progress: GameProgress): boolean {
  return Object.values(progress.completedPuzzles).every(Boolean);
}

export function isDormReadyToUnlock(progress: GameProgress): boolean {
  return canUnlockDormDoor(progress);
}

export function validateDormCode(code: string, expectedCode: string): boolean {
  return code.replace(/\s+/g, "") === expectedCode;
}

export function deriveDormPhase(progress: GameProgress): GamePhase {
  if (progress.reward.escaped) {
    return "escaped";
  }

  if (!progress.started) {
    return "intro";
  }

  if (canUnlockDormDoor(progress)) {
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

export function getDormCurrentObjective(progress: GameProgress): string {
  if (progress.reward.escaped) {
    return "Quest completed. Review the dorm reward screen or restart the run.";
  }

  if (!progress.started) {
    return "Start the quest to activate the dorm lounge investigation.";
  }

  if (!progress.completedPuzzles["notice-board"]) {
    return "Inspect the dorm notice board and record the quiet-hours time.";
  }

  if (!progress.completedPuzzles["return-cart"]) {
    return "Check the resident cubbies and recover the correct unit number.";
  }

  if (!progress.completedPuzzles.bookshelf) {
    return "Match the right backpack to Unit 105 and recover the returned RA passcard.";
  }

  if (!progress.completedPuzzles["circulation-desk"]) {
    return "Unlock the RA desk and log the after-hours hall access card.";
  }

  if (!progress.completedPuzzles.speaker) {
    return "Listen to the hall intercom and confirm which clue comes second.";
  }

  if (!progress.completedPuzzles["floor-map"]) {
    return "Verify the keypad format in the resident handbook before attempting the exit.";
  }

  return "Move to the hallway exit and enter the full dorm code.";
}

export function getDormObjectState(progress: GameProgress, objectId: RoomObjectId): RoomObjectState {
  const cleared = objectId === "exit-door" ? progress.reward.escaped : progress.completedPuzzles[objectId as PuzzleId];

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
      return progress.completedPuzzles.bookshelf && dormHasItem(progress, "ra-pass") ? "available" : "locked";
    case "speaker":
      return progress.completedPuzzles["circulation-desk"] ? "available" : "locked";
    case "floor-map":
      return progress.completedPuzzles.speaker ? "available" : "locked";
    case "exit-door":
      return "available";
  }
}

export function startDormQuest(progress: GameProgress): GameProgress {
  return syncProgress({
    ...progress,
    started: true,
  });
}

export interface DormDoorAttemptResult {
  nextProgress: GameProgress;
  success: boolean;
  message: string;
}

export function getDormUnlockBlockerMessage(progress: GameProgress): string {
  if (canUnlockDormDoor(progress)) {
    return "The hallway exit is ready. Enter the 7-digit code.";
  }

  return `You are not done yet. ${getDormCurrentObjective(progress)}`;
}

export function tryUnlockDormDoor(progress: GameProgress, code: string, expectedCode: string): DormDoorAttemptResult {
  const nextAttemptState = syncProgress({
    ...progress,
    keypadAttempts: progress.keypadAttempts + 1,
  });

  if (!canUnlockDormDoor(progress)) {
    return {
      nextProgress: nextAttemptState,
      success: false,
      message: getDormUnlockBlockerMessage(progress),
    };
  }

  if (!validateDormCode(code, expectedCode)) {
    return {
      nextProgress: nextAttemptState,
      success: false,
      message: "That sequence still does not match the unit clue, intercom order, and handbook format.",
    };
  }

  return {
    nextProgress: syncProgress({
      ...nextAttemptState,
      reward: {
        xpEarned: DORM_REWARD.xpEarned,
        badgeUnlocked: DORM_REWARD.badgeUnlocked,
        escaped: true,
      },
    }),
    success: true,
    message: "The hallway exit unlocks. You cleared the dorm lounge.",
  };
}

export function dormLockoutReducer(progress: GameProgress, action: DormGameAction): GameProgress {
  switch (action.type) {
    case "START_GAME":
      return startDormQuest(progress);
    case "COLLECT_NOTICE_BOARD":
      return collectDormNoticeClue(progress, action.clue, action.note);
    case "COLLECT_RETURN_CART":
      return collectDormCubbyClue(progress, action.clue, action.item, action.note);
    case "COLLECT_BOOKSHELF":
      return collectDormBackpackLead(progress, action.clue, action.item, action.note);
    case "COMPLETE_DESK":
      return completeDormDeskPuzzle(progress, action.item, action.note, action.usedItemId);
    case "COMPLETE_AUDIO":
      return completeDormAudioPuzzle(progress, action.note);
    case "COLLECT_FLOOR_MAP":
      return collectDormHandbookClue(progress, action.clue, action.note);
    case "SET_PROGRESS":
      return syncProgress(action.progress);
    default:
      return progress;
  }
}
