import { LAST_TRAIN_REWARD } from "@/components/last-train-escape/train-data";
import type { ClueItem, GamePhase, GameProgress, InventoryItem, InventoryState, PuzzleId, RoomObjectId, RoomObjectState } from "@/components/escape-room/types";

export type TrainGameAction =
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

export function trainHasItem(progress: GameProgress, itemId: string): boolean {
  return progress.inventory.items.some((item) => item.id === itemId);
}

function syncProgress(progress: GameProgress): GameProgress {
  const nextPhase = deriveTrainPhase(progress);

  return {
    ...progress,
    phase: nextPhase,
    currentObjective: getTrainCurrentObjective({
      ...progress,
      phase: nextPhase,
    }),
  };
}

export function createInitialTrainProgress(): GameProgress {
  return {
    started: false,
    phase: "intro",
    currentObjective: "Start the run and inspect the transit information board for the first station clue.",
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

export function collectTrainBoardClue(progress: GameProgress, clue: ClueItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "notice-board": true,
    },
    inventory: addUniqueNote(addUniqueClue(progress.inventory, clue), note),
  });
}

export function collectTrainKioskLead(progress: GameProgress, clue: ClueItem, item: InventoryItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "return-cart": true,
    },
    inventory: addUniqueNote(addUniqueItem(addUniqueClue(progress.inventory, clue), item), note),
  });
}

export function collectTrainBenchLead(progress: GameProgress, clue: ClueItem, item: InventoryItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      bookshelf: true,
    },
    inventory: addUniqueNote(addUniqueItem(addUniqueClue(progress.inventory, clue), item), note),
  });
}

export function completeTrainDeskPuzzle(progress: GameProgress, item: InventoryItem, note: string, usedItemId: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "circulation-desk": true,
    },
    inventory: addUniqueNote(addUniqueItem(markItemUsed(progress.inventory, usedItemId), item), note),
  });
}

export function completeTrainAudioPuzzle(progress: GameProgress, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      speaker: true,
    },
    inventory: addUniqueNote(progress.inventory, note),
  });
}

export function collectTrainSignClue(progress: GameProgress, clue: ClueItem, note: string): GameProgress {
  return syncProgress({
    ...progress,
    completedPuzzles: {
      ...progress.completedPuzzles,
      "floor-map": true,
    },
    inventory: addUniqueNote(addUniqueClue(progress.inventory, clue), note),
  });
}

export function getTrainCompletionCount(progress: GameProgress): number {
  return Object.values(progress.completedPuzzles).filter(Boolean).length;
}

export function getTrainCompletionPercent(progress: GameProgress): number {
  return Math.round((getTrainCompletionCount(progress) / Object.keys(defaultPuzzles).length) * 100);
}

export function canUnlockTrainDoor(progress: GameProgress): boolean {
  return Object.values(progress.completedPuzzles).every(Boolean);
}

export function isTrainReadyToUnlock(progress: GameProgress): boolean {
  return canUnlockTrainDoor(progress);
}

export function validateTrainCode(code: string, expectedCode: string): boolean {
  return code.replace(/\s+/g, "") === expectedCode;
}

export function deriveTrainPhase(progress: GameProgress): GamePhase {
  if (progress.reward.escaped) {
    return "escaped";
  }

  if (!progress.started) {
    return "intro";
  }

  if (canUnlockTrainDoor(progress)) {
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

export function getTrainCurrentObjective(progress: GameProgress): string {
  if (progress.reward.escaped) {
    return "Quest completed. Review the station reward screen or restart the run.";
  }

  if (!progress.started) {
    return "Start the quest to activate the station platform investigation.";
  }

  if (!progress.completedPuzzles["notice-board"]) {
    return "Inspect the transit board and record the final line number.";
  }

  if (!progress.completedPuzzles["return-cart"]) {
    return "Print the correct ticket reissue slip and log the matching bench seat.";
  }

  if (!progress.completedPuzzles.bookshelf) {
    return "Search the Seat B2 bench bag and recover the service token plus departure time.";
  }

  if (!progress.completedPuzzles["circulation-desk"]) {
    return "Unlock the service booth and log the gate override card.";
  }

  if (!progress.completedPuzzles.speaker) {
    return "Listen to the platform announcement and confirm which clue comes second.";
  }

  if (!progress.completedPuzzles["floor-map"]) {
    return "Verify the gate sign array and confirm the keypad format before attempting the exit.";
  }

  return "Move to the platform exit gate and enter the full station code.";
}

export function getTrainObjectState(progress: GameProgress, objectId: RoomObjectId): RoomObjectState {
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
      return progress.completedPuzzles.bookshelf && trainHasItem(progress, "service-token") ? "available" : "locked";
    case "speaker":
      return progress.completedPuzzles["circulation-desk"] ? "available" : "locked";
    case "floor-map":
      return progress.completedPuzzles.speaker ? "available" : "locked";
    case "exit-door":
      return "available";
  }
}

export function startTrainQuest(progress: GameProgress): GameProgress {
  return syncProgress({
    ...progress,
    started: true,
  });
}

export interface TrainDoorAttemptResult {
  nextProgress: GameProgress;
  success: boolean;
  message: string;
}

export function getTrainUnlockBlockerMessage(progress: GameProgress): string {
  if (canUnlockTrainDoor(progress)) {
    return "The platform gate is ready. Enter the 7-digit code.";
  }

  return `You are not done yet. ${getTrainCurrentObjective(progress)}`;
}

export function tryUnlockTrainDoor(progress: GameProgress, code: string, expectedCode: string): TrainDoorAttemptResult {
  const nextAttemptState = syncProgress({
    ...progress,
    keypadAttempts: progress.keypadAttempts + 1,
  });

  if (!canUnlockTrainDoor(progress)) {
    return {
      nextProgress: nextAttemptState,
      success: false,
      message: getTrainUnlockBlockerMessage(progress),
    };
  }

  if (!validateTrainCode(code, expectedCode)) {
    return {
      nextProgress: nextAttemptState,
      success: false,
      message: "That sequence still does not match the line clue, platform order, and gate format.",
    };
  }

  return {
    nextProgress: syncProgress({
      ...nextAttemptState,
      reward: {
        xpEarned: LAST_TRAIN_REWARD.xpEarned,
        badgeUnlocked: LAST_TRAIN_REWARD.badgeUnlocked,
        escaped: true,
      },
    }),
    success: true,
    message: "The platform gate unlocks. You cleared the last train stage.",
  };
}

export function lastTrainReducer(progress: GameProgress, action: TrainGameAction): GameProgress {
  switch (action.type) {
    case "START_GAME":
      return startTrainQuest(progress);
    case "COLLECT_NOTICE_BOARD":
      return collectTrainBoardClue(progress, action.clue, action.note);
    case "COLLECT_RETURN_CART":
      return collectTrainKioskLead(progress, action.clue, action.item, action.note);
    case "COLLECT_BOOKSHELF":
      return collectTrainBenchLead(progress, action.clue, action.item, action.note);
    case "COMPLETE_DESK":
      return completeTrainDeskPuzzle(progress, action.item, action.note, action.usedItemId);
    case "COMPLETE_AUDIO":
      return completeTrainAudioPuzzle(progress, action.note);
    case "COLLECT_FLOOR_MAP":
      return collectTrainSignClue(progress, action.clue, action.note);
    case "SET_PROGRESS":
      return syncProgress(action.progress);
    default:
      return progress;
  }
}
