import { describe, expect, it } from "vitest";

import {
  collectDormBackpackLead,
  collectDormCubbyClue,
  collectDormHandbookClue,
  collectDormNoticeClue,
  completeDormAudioPuzzle,
  completeDormDeskPuzzle,
  createInitialDormProgress,
  getDormObjectState,
  isDormReadyToUnlock,
  startDormQuest,
  tryUnlockDormDoor,
} from "@/components/dorm-lockout/dorm-engine";
import {
  DORM_BACKPACK_CLUE,
  DORM_BACKPACK_NOTE,
  DORM_CUBBY_CLUE,
  DORM_CUBBY_NOTE,
  DORM_HANDBOOK_CLUE,
  DORM_HANDBOOK_NOTE,
  DORM_INTERCOM_NOTE,
  DORM_LOCKOUT_CODE,
  DORM_NOTICE_CLUE,
  DORM_NOTICE_NOTE,
  DORM_DESK_NOTE,
  HALL_ACCESS_CARD_ITEM,
  RA_PASS_ITEM,
  UNIT_MAIL_SLIP_ITEM,
} from "@/components/dorm-lockout/dorm-data";

describe("dorm lockout engine", () => {
  it("adds the quiet-hours clue and unlocks the unit cubbies", () => {
    const started = startDormQuest(createInitialDormProgress());
    const next = collectDormNoticeClue(started, DORM_NOTICE_CLUE, DORM_NOTICE_NOTE);

    expect(next.completedPuzzles["notice-board"]).toBe(true);
    expect(next.inventory.clues.map((clue) => clue.value)).toContain("1045");
    expect(next.inventory.notes).toContain(DORM_NOTICE_NOTE);
    expect(getDormObjectState(next, "return-cart")).toBe("available");
  });

  it("adds the unit clue and unlocks the backpack search", () => {
    const started = startDormQuest(createInitialDormProgress());
    const withNotice = collectDormNoticeClue(started, DORM_NOTICE_CLUE, DORM_NOTICE_NOTE);
    const withCubbies = collectDormCubbyClue(withNotice, DORM_CUBBY_CLUE, UNIT_MAIL_SLIP_ITEM, DORM_CUBBY_NOTE);

    expect(withCubbies.completedPuzzles["return-cart"]).toBe(true);
    expect(withCubbies.inventory.clues.map((clue) => clue.value)).toContain("105");
    expect(withCubbies.inventory.items.map((item) => item.id)).toContain("mail-slip");
    expect(getDormObjectState(withCubbies, "bookshelf")).toBe("available");
  });

  it("recovers the RA passcard from the matching backpack", () => {
    const started = startDormQuest(createInitialDormProgress());
    const withNotice = collectDormNoticeClue(started, DORM_NOTICE_CLUE, DORM_NOTICE_NOTE);
    const withCubbies = collectDormCubbyClue(withNotice, DORM_CUBBY_CLUE, UNIT_MAIL_SLIP_ITEM, DORM_CUBBY_NOTE);
    const withBackpack = collectDormBackpackLead(withCubbies, DORM_BACKPACK_CLUE, RA_PASS_ITEM, DORM_BACKPACK_NOTE);

    expect(withBackpack.completedPuzzles.bookshelf).toBe(true);
    expect(withBackpack.inventory.items.map((item) => item.id)).toContain("ra-pass");
    expect(getDormObjectState(withBackpack, "circulation-desk")).toBe("available");
  });

  it("marks the RA pass used when the desk drawer is cleared", () => {
    const started = startDormQuest(createInitialDormProgress());
    const withNotice = collectDormNoticeClue(started, DORM_NOTICE_CLUE, DORM_NOTICE_NOTE);
    const withCubbies = collectDormCubbyClue(withNotice, DORM_CUBBY_CLUE, UNIT_MAIL_SLIP_ITEM, DORM_CUBBY_NOTE);
    const withBackpack = collectDormBackpackLead(withCubbies, DORM_BACKPACK_CLUE, RA_PASS_ITEM, DORM_BACKPACK_NOTE);
    const withDesk = completeDormDeskPuzzle(withBackpack, HALL_ACCESS_CARD_ITEM, DORM_DESK_NOTE, RA_PASS_ITEM.id);

    expect(withDesk.completedPuzzles["circulation-desk"]).toBe(true);
    expect(withDesk.inventory.items.find((item) => item.id === RA_PASS_ITEM.id)?.used).toBe(true);
    expect(withDesk.inventory.items.map((item) => item.id)).toContain("hall-access-card");
    expect(getDormObjectState(withDesk, "speaker")).toBe("available");
  });

  it("blocks the hallway exit until the handbook format is logged", () => {
    const started = startDormQuest(createInitialDormProgress());
    const withNotice = collectDormNoticeClue(started, DORM_NOTICE_CLUE, DORM_NOTICE_NOTE);
    const withCubbies = collectDormCubbyClue(withNotice, DORM_CUBBY_CLUE, UNIT_MAIL_SLIP_ITEM, DORM_CUBBY_NOTE);
    const withBackpack = collectDormBackpackLead(withCubbies, DORM_BACKPACK_CLUE, RA_PASS_ITEM, DORM_BACKPACK_NOTE);
    const withDesk = completeDormDeskPuzzle(withBackpack, HALL_ACCESS_CARD_ITEM, DORM_DESK_NOTE, RA_PASS_ITEM.id);
    const withAudio = completeDormAudioPuzzle(withDesk, DORM_INTERCOM_NOTE);
    const blocked = tryUnlockDormDoor(withAudio, DORM_LOCKOUT_CODE, DORM_LOCKOUT_CODE);
    const ready = collectDormHandbookClue(withAudio, DORM_HANDBOOK_CLUE, DORM_HANDBOOK_NOTE);

    expect(isDormReadyToUnlock(withAudio)).toBe(false);
    expect(blocked.success).toBe(false);
    expect(blocked.message).toContain("handbook");
    expect(isDormReadyToUnlock(ready)).toBe(true);
  });

  it("unlocks the dorm with the correct final code after the full sequence is complete", () => {
    const started = startDormQuest(createInitialDormProgress());
    const withNotice = collectDormNoticeClue(started, DORM_NOTICE_CLUE, DORM_NOTICE_NOTE);
    const withCubbies = collectDormCubbyClue(withNotice, DORM_CUBBY_CLUE, UNIT_MAIL_SLIP_ITEM, DORM_CUBBY_NOTE);
    const withBackpack = collectDormBackpackLead(withCubbies, DORM_BACKPACK_CLUE, RA_PASS_ITEM, DORM_BACKPACK_NOTE);
    const withDesk = completeDormDeskPuzzle(withBackpack, HALL_ACCESS_CARD_ITEM, DORM_DESK_NOTE, RA_PASS_ITEM.id);
    const withAudio = completeDormAudioPuzzle(withDesk, DORM_INTERCOM_NOTE);
    const ready = collectDormHandbookClue(withAudio, DORM_HANDBOOK_CLUE, DORM_HANDBOOK_NOTE);
    const result = tryUnlockDormDoor(ready, DORM_LOCKOUT_CODE, DORM_LOCKOUT_CODE);

    expect(result.success).toBe(true);
    expect(result.nextProgress.reward.escaped).toBe(true);
    expect(result.nextProgress.reward.xpEarned).toBe(60);
    expect(result.nextProgress.reward.badgeUnlocked).toBe("Night Owl Resident");
  });
});
