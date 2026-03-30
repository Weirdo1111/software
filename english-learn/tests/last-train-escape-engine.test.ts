import { describe, expect, it } from "vitest";

import {
  collectTrainBenchLead,
  collectTrainBoardClue,
  collectTrainKioskLead,
  collectTrainSignClue,
  completeTrainAudioPuzzle,
  completeTrainDeskPuzzle,
  createInitialTrainProgress,
  getTrainObjectState,
  isTrainReadyToUnlock,
  startTrainQuest,
  tryUnlockTrainDoor,
} from "@/components/last-train-escape/train-engine";
import {
  GATE_OVERRIDE_CARD_ITEM,
  LAST_TRAIN_CODE,
  SERVICE_TOKEN_ITEM,
  TRAIN_BENCH_CLUE,
  TRAIN_BENCH_NOTE,
  TRAIN_BOARD_CLUE,
  TRAIN_BOARD_NOTE,
  TRAIN_KIOSK_CLUE,
  TRAIN_KIOSK_NOTE,
  TRAIN_SIGN_CLUE,
  TRAIN_SIGN_NOTE,
  TRAIN_SPEAKER_NOTE,
  TRAIN_DESK_NOTE,
  TRANSFER_SLIP_ITEM,
} from "@/components/last-train-escape/train-data";

describe("last train escape engine", () => {
  it("adds the line clue and unlocks the ticket kiosk", () => {
    const started = startTrainQuest(createInitialTrainProgress());
    const next = collectTrainBoardClue(started, TRAIN_BOARD_CLUE, TRAIN_BOARD_NOTE);

    expect(next.completedPuzzles["notice-board"]).toBe(true);
    expect(next.inventory.clues.map((clue) => clue.value)).toContain("412");
    expect(next.inventory.notes).toContain(TRAIN_BOARD_NOTE);
    expect(getTrainObjectState(next, "return-cart")).toBe("available");
  });

  it("adds the seat claim and unlocks the bench search", () => {
    const started = startTrainQuest(createInitialTrainProgress());
    const withBoard = collectTrainBoardClue(started, TRAIN_BOARD_CLUE, TRAIN_BOARD_NOTE);
    const withKiosk = collectTrainKioskLead(withBoard, TRAIN_KIOSK_CLUE, TRANSFER_SLIP_ITEM, TRAIN_KIOSK_NOTE);

    expect(withKiosk.completedPuzzles["return-cart"]).toBe(true);
    expect(withKiosk.inventory.clues.map((clue) => clue.value)).toContain("SEAT B2");
    expect(withKiosk.inventory.items.map((item) => item.id)).toContain("transfer-slip");
    expect(getTrainObjectState(withKiosk, "bookshelf")).toBe("available");
  });

  it("recovers the service token and departure time from the matching bench bag", () => {
    const started = startTrainQuest(createInitialTrainProgress());
    const withBoard = collectTrainBoardClue(started, TRAIN_BOARD_CLUE, TRAIN_BOARD_NOTE);
    const withKiosk = collectTrainKioskLead(withBoard, TRAIN_KIOSK_CLUE, TRANSFER_SLIP_ITEM, TRAIN_KIOSK_NOTE);
    const withBench = collectTrainBenchLead(withKiosk, TRAIN_BENCH_CLUE, SERVICE_TOKEN_ITEM, TRAIN_BENCH_NOTE);

    expect(withBench.completedPuzzles.bookshelf).toBe(true);
    expect(withBench.inventory.clues.map((clue) => clue.value)).toContain("1140");
    expect(withBench.inventory.items.map((item) => item.id)).toContain("service-token");
    expect(getTrainObjectState(withBench, "circulation-desk")).toBe("available");
  });

  it("marks the service token used when the booth drawer is cleared", () => {
    const started = startTrainQuest(createInitialTrainProgress());
    const withBoard = collectTrainBoardClue(started, TRAIN_BOARD_CLUE, TRAIN_BOARD_NOTE);
    const withKiosk = collectTrainKioskLead(withBoard, TRAIN_KIOSK_CLUE, TRANSFER_SLIP_ITEM, TRAIN_KIOSK_NOTE);
    const withBench = collectTrainBenchLead(withKiosk, TRAIN_BENCH_CLUE, SERVICE_TOKEN_ITEM, TRAIN_BENCH_NOTE);
    const withDesk = completeTrainDeskPuzzle(withBench, GATE_OVERRIDE_CARD_ITEM, TRAIN_DESK_NOTE, SERVICE_TOKEN_ITEM.id);

    expect(withDesk.completedPuzzles["circulation-desk"]).toBe(true);
    expect(withDesk.inventory.items.find((item) => item.id === SERVICE_TOKEN_ITEM.id)?.used).toBe(true);
    expect(withDesk.inventory.items.map((item) => item.id)).toContain("gate-override-card");
    expect(getTrainObjectState(withDesk, "speaker")).toBe("available");
  });

  it("blocks the gate until the format signage is logged", () => {
    const started = startTrainQuest(createInitialTrainProgress());
    const withBoard = collectTrainBoardClue(started, TRAIN_BOARD_CLUE, TRAIN_BOARD_NOTE);
    const withKiosk = collectTrainKioskLead(withBoard, TRAIN_KIOSK_CLUE, TRANSFER_SLIP_ITEM, TRAIN_KIOSK_NOTE);
    const withBench = collectTrainBenchLead(withKiosk, TRAIN_BENCH_CLUE, SERVICE_TOKEN_ITEM, TRAIN_BENCH_NOTE);
    const withDesk = completeTrainDeskPuzzle(withBench, GATE_OVERRIDE_CARD_ITEM, TRAIN_DESK_NOTE, SERVICE_TOKEN_ITEM.id);
    const withAudio = completeTrainAudioPuzzle(withDesk, TRAIN_SPEAKER_NOTE);
    const blocked = tryUnlockTrainDoor(withAudio, LAST_TRAIN_CODE, LAST_TRAIN_CODE);
    const ready = collectTrainSignClue(withAudio, TRAIN_SIGN_CLUE, TRAIN_SIGN_NOTE);

    expect(isTrainReadyToUnlock(withAudio)).toBe(false);
    expect(blocked.success).toBe(false);
    expect(blocked.message).toContain("keypad format");
    expect(isTrainReadyToUnlock(ready)).toBe(true);
  });

  it("unlocks the gate with the correct final code after the full station sequence", () => {
    const started = startTrainQuest(createInitialTrainProgress());
    const withBoard = collectTrainBoardClue(started, TRAIN_BOARD_CLUE, TRAIN_BOARD_NOTE);
    const withKiosk = collectTrainKioskLead(withBoard, TRAIN_KIOSK_CLUE, TRANSFER_SLIP_ITEM, TRAIN_KIOSK_NOTE);
    const withBench = collectTrainBenchLead(withKiosk, TRAIN_BENCH_CLUE, SERVICE_TOKEN_ITEM, TRAIN_BENCH_NOTE);
    const withDesk = completeTrainDeskPuzzle(withBench, GATE_OVERRIDE_CARD_ITEM, TRAIN_DESK_NOTE, SERVICE_TOKEN_ITEM.id);
    const withAudio = completeTrainAudioPuzzle(withDesk, TRAIN_SPEAKER_NOTE);
    const ready = collectTrainSignClue(withAudio, TRAIN_SIGN_CLUE, TRAIN_SIGN_NOTE);
    const result = tryUnlockTrainDoor(ready, LAST_TRAIN_CODE, LAST_TRAIN_CODE);

    expect(result.success).toBe(true);
    expect(result.nextProgress.reward.escaped).toBe(true);
    expect(result.nextProgress.reward.xpEarned).toBe(70);
    expect(result.nextProgress.reward.badgeUnlocked).toBe("Last Train Rider");
  });
});
