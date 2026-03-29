import { describe, expect, it } from "vitest";

import {
  collectBookshelfClue,
  collectFloorMapClue,
  collectNoticeBoardClue,
  collectReturnCartLead,
  completeAudioPuzzle,
  completeDeskPuzzle,
  createInitialGameProgress,
  getObjectState,
  isReadyToUnlock,
  startQuest,
  tryUnlockDoor,
} from "@/components/escape-room/puzzle-engine";
import {
  BOOKSHELF_CLUE,
  BOOKSHELF_NOTE,
  DESK_KEY_ITEM,
  DESK_NOTE,
  ESCAPE_ROOM_CODE,
  FLOOR_MAP_CLUE,
  FLOOR_MAP_NOTE,
  NOTICE_BOARD_CLUE,
  NOTICE_BOARD_NOTE,
  PROCEDURE_CARD_ITEM,
  RESHELVING_SLIP_ITEM,
  RETURN_CART_CLUE,
  RETURN_CART_NOTE,
  SPEAKER_NOTE,
} from "@/components/escape-room/room-data";

describe("escape room puzzle engine", () => {
  it("adds the notice-board clue and unlocks the return cart next", () => {
    const started = startQuest(createInitialGameProgress());
    const next = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE, NOTICE_BOARD_NOTE);

    expect(next.completedPuzzles["notice-board"]).toBe(true);
    expect(next.inventory.clues.map((clue) => clue.value)).toContain("915");
    expect(next.inventory.notes).toContain(NOTICE_BOARD_NOTE);
    expect(getObjectState(next, "return-cart")).toBe("available");
    expect(next.currentObjective).toContain("return cart");
  });

  it("adds the cart lead item and unlocks the history stacks", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE, NOTICE_BOARD_NOTE);
    const withCart = collectReturnCartLead(withNotice, RETURN_CART_CLUE, RESHELVING_SLIP_ITEM, RETURN_CART_NOTE);

    expect(withCart.completedPuzzles["return-cart"]).toBe(true);
    expect(withCart.inventory.items.map((item) => item.label)).toContain("Reshelving Slip");
    expect(withCart.inventory.clues.map((clue) => clue.value)).toContain("HISTORY");
    expect(getObjectState(withCart, "bookshelf")).toBe("available");
  });

  it("collects the shelf code and desk key from the stacks", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE, NOTICE_BOARD_NOTE);
    const withCart = collectReturnCartLead(withNotice, RETURN_CART_CLUE, RESHELVING_SLIP_ITEM, RETURN_CART_NOTE);
    const withShelf = collectBookshelfClue(withCart, BOOKSHELF_CLUE, DESK_KEY_ITEM, BOOKSHELF_NOTE);

    expect(withShelf.completedPuzzles.bookshelf).toBe(true);
    expect(withShelf.inventory.clues.map((clue) => clue.value)).toContain("204");
    expect(withShelf.inventory.items.map((item) => item.id)).toContain("desk-key");
    expect(getObjectState(withShelf, "circulation-desk")).toBe("available");
  });

  it("marks the desk key used when the circulation drawer is cleared", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE, NOTICE_BOARD_NOTE);
    const withCart = collectReturnCartLead(withNotice, RETURN_CART_CLUE, RESHELVING_SLIP_ITEM, RETURN_CART_NOTE);
    const withShelf = collectBookshelfClue(withCart, BOOKSHELF_CLUE, DESK_KEY_ITEM, BOOKSHELF_NOTE);
    const withDesk = completeDeskPuzzle(withShelf, PROCEDURE_CARD_ITEM, DESK_NOTE, DESK_KEY_ITEM.id);

    expect(withDesk.completedPuzzles["circulation-desk"]).toBe(true);
    expect(withDesk.inventory.items.find((item) => item.id === DESK_KEY_ITEM.id)?.used).toBe(true);
    expect(withDesk.inventory.items.map((item) => item.id)).toContain("procedure-card");
    expect(getObjectState(withDesk, "speaker")).toBe("available");
  });

  it("keeps the door locked until the full board-cart-stacks-desk-speaker-map chain is complete", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE, NOTICE_BOARD_NOTE);
    const withCart = collectReturnCartLead(withNotice, RETURN_CART_CLUE, RESHELVING_SLIP_ITEM, RETURN_CART_NOTE);
    const withShelf = collectBookshelfClue(withCart, BOOKSHELF_CLUE, DESK_KEY_ITEM, BOOKSHELF_NOTE);
    const withDesk = completeDeskPuzzle(withShelf, PROCEDURE_CARD_ITEM, DESK_NOTE, DESK_KEY_ITEM.id);
    const withAudio = completeAudioPuzzle(withDesk, SPEAKER_NOTE);
    const blocked = tryUnlockDoor(withAudio, ESCAPE_ROOM_CODE, ESCAPE_ROOM_CODE);
    const ready = collectFloorMapClue(withAudio, FLOOR_MAP_CLUE, FLOOR_MAP_NOTE);

    expect(isReadyToUnlock(withAudio)).toBe(false);
    expect(blocked.success).toBe(false);
    expect(blocked.message).toContain("floor map");
    expect(isReadyToUnlock(ready)).toBe(true);
  });

  it("unlocks the library with the correct final code after the full sequence is complete", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE, NOTICE_BOARD_NOTE);
    const withCart = collectReturnCartLead(withNotice, RETURN_CART_CLUE, RESHELVING_SLIP_ITEM, RETURN_CART_NOTE);
    const withShelf = collectBookshelfClue(withCart, BOOKSHELF_CLUE, DESK_KEY_ITEM, BOOKSHELF_NOTE);
    const withDesk = completeDeskPuzzle(withShelf, PROCEDURE_CARD_ITEM, DESK_NOTE, DESK_KEY_ITEM.id);
    const withAudio = completeAudioPuzzle(withDesk, SPEAKER_NOTE);
    const ready = collectFloorMapClue(withAudio, FLOOR_MAP_CLUE, FLOOR_MAP_NOTE);
    const result = tryUnlockDoor(ready, ESCAPE_ROOM_CODE, ESCAPE_ROOM_CODE);

    expect(isReadyToUnlock(ready)).toBe(true);
    expect(result.success).toBe(true);
    expect(result.nextProgress.reward.escaped).toBe(true);
    expect(result.nextProgress.reward.xpEarned).toBe(50);
    expect(result.nextProgress.reward.badgeUnlocked).toBe("Midnight Reader");
  });

  it("rejects incorrect keypad order even when every clue is collected", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE, NOTICE_BOARD_NOTE);
    const withCart = collectReturnCartLead(withNotice, RETURN_CART_CLUE, RESHELVING_SLIP_ITEM, RETURN_CART_NOTE);
    const withShelf = collectBookshelfClue(withCart, BOOKSHELF_CLUE, DESK_KEY_ITEM, BOOKSHELF_NOTE);
    const withDesk = completeDeskPuzzle(withShelf, PROCEDURE_CARD_ITEM, DESK_NOTE, DESK_KEY_ITEM.id);
    const withAudio = completeAudioPuzzle(withDesk, SPEAKER_NOTE);
    const ready = collectFloorMapClue(withAudio, FLOOR_MAP_CLUE, FLOOR_MAP_NOTE);
    const result = tryUnlockDoor(ready, "915204", ESCAPE_ROOM_CODE);

    expect(result.success).toBe(false);
    expect(result.message).toContain("does not match");
    expect(result.nextProgress.keypadAttempts).toBe(1);
  });
});
