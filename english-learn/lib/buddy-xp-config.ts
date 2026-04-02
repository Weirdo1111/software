export const BUDDY_XP_RULES = {
  listeningCompletion: 15,
  speakingCompletion: 20,
  readingCompletion: 15,
  writingCompletion: 20,
  reviewSession: 10,
  wordGameClear: 25,
  escapeRoomClear: 50,
  dormLockoutClear: 60,
  lastTrainClear: 70,
} as const;

export const ESCAPE_ROOM_CLEAR_KEY = "escape-room-best-seconds-v1";
export const DORM_LOCKOUT_CLEAR_KEY = "dorm-lockout-best-seconds-v1";
export const LAST_TRAIN_CLEAR_KEY = "last-train-best-seconds-v1";

export type BuddyXpAwardSource =
  | "listeningCompletion"
  | "speakingCompletion"
  | "readingCompletion"
  | "writingCompletion"
  | "reviewSession"
  | "wordGameClear"
  | "escapeRoomClear"
  | "dormLockoutClear"
  | "lastTrainClear";

export function getBuddyXpForSource(source: BuddyXpAwardSource) {
  return BUDDY_XP_RULES[source];
}
