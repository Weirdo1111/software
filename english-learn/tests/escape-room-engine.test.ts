import { describe, expect, it } from "vitest";

import { detectDialogueIntent, resolveDialogueTurn } from "@/components/escape-room/dialogue-rules";
import {
  collectBookshelfClue,
  collectNoticeBoardClue,
  completeAudioPuzzle,
  completeChoiceQuiz,
  completeDialoguePuzzle,
  createInitialGameProgress,
  isReadyToUnlock,
  startQuest,
  tryUnlockDoor,
} from "@/components/escape-room/puzzle-engine";
import { BOOKSHELF_CLUE, ESCAPE_ROOM_CODE, LIBRARIAN_HINT, NOTICE_BOARD_CLUE, QUIZ_NOTE, SPEAKER_NOTE } from "@/components/escape-room/room-data";

describe("escape room puzzle engine", () => {
  it("adds the notice-board clue and marks that puzzle complete", () => {
    const started = startQuest(createInitialGameProgress());
    const next = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE);

    expect(next.completedPuzzles["notice-board"]).toBe(true);
    expect(next.inventory.clues.map((clue) => clue.value)).toContain("915");
    expect(next.currentObjective).toContain("history shelf");
  });

  it("adds the bookshelf clue and keeps the room locked until the rest is complete", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE);
    const withShelf = collectBookshelfClue(withNotice, BOOKSHELF_CLUE);
    const attempted = tryUnlockDoor(withShelf, ESCAPE_ROOM_CODE, ESCAPE_ROOM_CODE);

    expect(withShelf.completedPuzzles.bookshelf).toBe(true);
    expect(withShelf.inventory.clues.map((clue) => clue.value)).toContain("204");
    expect(isReadyToUnlock(withShelf)).toBe(false);
    expect(attempted.success).toBe(false);
    expect(attempted.message).toContain("more clues");
  });

  it("unlocks the library with the correct final code after all puzzles are complete", () => {
    const started = startQuest(createInitialGameProgress());
    const withNotice = collectNoticeBoardClue(started, NOTICE_BOARD_CLUE);
    const withShelf = collectBookshelfClue(withNotice, BOOKSHELF_CLUE);
    const withAudio = completeAudioPuzzle(withShelf, SPEAKER_NOTE);
    const withDialogue = completeDialoguePuzzle(withAudio, LIBRARIAN_HINT);
    const ready = completeChoiceQuiz(withDialogue, QUIZ_NOTE);
    const result = tryUnlockDoor(ready, ESCAPE_ROOM_CODE, ESCAPE_ROOM_CODE);

    expect(isReadyToUnlock(ready)).toBe(true);
    expect(result.success).toBe(true);
    expect(result.nextProgress.reward.escaped).toBe(true);
    expect(result.nextProgress.reward.xpEarned).toBe(50);
    expect(result.nextProgress.reward.badgeUnlocked).toBe("Midnight Reader");
  });
});

describe("escape room dialogue rules", () => {
  it("detects polite help requests", () => {
    expect(detectDialogueIntent("Could you help me with the exit code, please?")).toBe("ask_for_help");
  });

  it("detects clue and hint requests as a solvable intent", () => {
    const resolved = resolveDialogueTurn("Can you give me a hint?");

    expect(resolved.intent).toBe("ask_for_hint");
    expect(resolved.solved).toBe(true);
  });

  it("rejects demanding requests as impolite", () => {
    expect(detectDialogueIntent("Give me the code.")).toBe("impolite_request");
  });

  it("requires polite wording before a hint request solves the dialogue", () => {
    const resolved = resolveDialogueTurn("hint please");
    const impoliteHint = resolveDialogueTurn("hint");

    expect(resolved.solved).toBe(true);
    expect(impoliteHint.solved).toBe(false);
  });
});
