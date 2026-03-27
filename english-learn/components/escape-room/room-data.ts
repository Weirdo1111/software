import type { AudioPuzzle, ChoiceQuiz, ClueItem, ClueModalContent, ProgressTask, RoomObject } from "@/components/escape-room/types";

export const ESCAPE_ROOM_CODE = "204915";
export const ESCAPE_ROOM_COUNTDOWN_SECONDS = 300;
export const ESCAPE_ROOM_ATTEMPT_LIMIT = 3;

export const NOTICE_BOARD_CLUE: ClueItem = {
  id: "closing-time",
  label: "Closing time",
  value: "915",
  source: "notice-board",
  description: "Library closes at 9:15 PM.",
};

export const BOOKSHELF_CLUE: ClueItem = {
  id: "history-shelf",
  label: "History shelf",
  value: "204",
  source: "bookshelf",
  description: "History Section - Shelf 204.",
};

export const SPEAKER_NOTE = "The announcement says to use the closing time second.";
export const LIBRARIAN_HINT = "Of course. Use the shelf number first, then the closing time.";
export const QUIZ_NOTE = "Polite requests make it easier to get help in the library.";

export const QUEST_REWARD = {
  xpEarned: 50,
  badgeUnlocked: "Midnight Reader",
};

export const roomObjects: RoomObject[] = [
  {
    id: "notice-board",
    name: "Notice Board",
    shortLabel: "Read",
    description: "Check the closing notice and staff reminders.",
    hotspot: { left: "17%", top: "27%" },
    modalType: "clue",
    required: true,
    accent: "bg-amber-500/90",
  },
  {
    id: "bookshelf",
    name: "Bookshelf",
    shortLabel: "Inspect",
    description: "Find the history shelf number.",
    hotspot: { left: "38%", top: "52%" },
    modalType: "clue",
    required: true,
    accent: "bg-sky-500/90",
  },
  {
    id: "speaker",
    name: "Speaker",
    shortLabel: "Listen",
    description: "Replay the final library announcement.",
    hotspot: { left: "71%", top: "20%" },
    modalType: "audio",
    required: true,
    accent: "bg-violet-500/90",
  },
  {
    id: "librarian-desk-terminal",
    name: "AI Librarian",
    shortLabel: "Ask",
    description: "Ask the library assistant for help in English.",
    hotspot: { left: "67%", top: "55%" },
    modalType: "dialogue",
    required: true,
    accent: "bg-emerald-500/90",
  },
  {
    id: "exit-door",
    name: "Exit Door",
    shortLabel: "Unlock",
    description: "Enter the final code to leave the library.",
    hotspot: { left: "87%", top: "43%" },
    modalType: "keypad",
    required: true,
    accent: "bg-[var(--navy)]",
  },
];

export const progressTasks: ProgressTask[] = [
  {
    id: "notice-board",
    label: "Read the closing notice",
    supportText: "Collect the library closing time from the notice board.",
  },
  {
    id: "bookshelf",
    label: "Inspect the history shelf",
    supportText: "Find the shelf number hidden in the history section.",
  },
  {
    id: "speaker",
    label: "Listen to the broadcast",
    supportText: "Confirm which clue should be used second in the code.",
  },
  {
    id: "librarian-desk-terminal",
    label: "Ask the librarian politely",
    supportText: "Use polite English to get the final ordering hint.",
  },
  {
    id: "quiz",
    label: "Pass the library etiquette quiz",
    supportText: "Choose the most polite sentence before the exit unlocks.",
  },
];

export const clueModalContent: Record<"notice-board" | "bookshelf", ClueModalContent> = {
  "notice-board": {
    id: "notice-board",
    title: "Closing Notice",
    subtitle: "The board near the entrance still shows the final staff reminders.",
    headline: "Library closes at 9:15 PM",
    body: "The closing time looks like part of the keypad code. Keep the number and remember the order hint from the room.",
    lines: [
      "Library closes at 9:15 PM",
      "Emergency exit access is restricted",
      "Ask staff if you need help finding a section",
    ],
    clue: NOTICE_BOARD_CLUE,
  },
  "bookshelf": {
    id: "bookshelf",
    title: "Shelf Marker",
    subtitle: "A history shelf label is still lit by the aisle lamp.",
    headline: "History Section - Shelf 204",
    body: "This shelf number looks like the first half of the exit code. Record it before you move on.",
    lines: [
      "History Section - Shelf 204",
      "Level 2 Reference Area",
      "Return books to the cart before closing",
    ],
    clue: BOOKSHELF_CLUE,
  },
};

export const speakerPuzzle: AudioPuzzle = {
  prompt: "Attention, visitors. The final exit code uses the history shelf number first, then the closing time.",
  instruction:
    "Listen to the closing announcement. You are not collecting a new number here; you are confirming the correct order for the code.",
  src: "/quests/escape-room/audio/library-announcement.wav",
  transcript:
    "Attention, visitors. The library will close at 9:15 p.m. The final exit code uses the history shelf number first, then the closing time. Please make your way to the front desk if you need help before leaving.",
  clueValue: "Closing time second",
  steps: [
    {
      id: "announcement-order",
      question: "What does the announcement say to use second?",
      answerId: "closing-time",
      options: [
        { id: "librarian-name", text: "The librarian's name", isCorrect: false, feedback: "The announcement never mentions a name for the code." },
        { id: "closing-time", text: "The closing time", isCorrect: true, feedback: "Correct. The closing time should be used second." },
        { id: "map-number", text: "The map number", isCorrect: false, feedback: "The announcement does not mention any map number." },
        { id: "floor-color", text: "The floor color", isCorrect: false, feedback: "That detail is not part of the exit code." },
      ],
    },
    {
      id: "order-check",
      question: "Which clue order matches the broadcast?",
      answerId: "shelf-then-time",
      options: [
        {
          id: "shelf-then-time",
          text: "History shelf number first, then the closing time",
          isCorrect: true,
          feedback: "Correct. Use 204 first, then 915.",
        },
        {
          id: "time-then-shelf",
          text: "Closing time first, then the history shelf number",
          isCorrect: false,
          feedback: "That reverses the order from the broadcast.",
        },
        {
          id: "desk-then-time",
          text: "Front desk number first, then the closing time",
          isCorrect: false,
          feedback: "The announcement points to the history shelf, not the desk.",
        },
        {
          id: "map-then-shelf",
          text: "Map number first, then the shelf number",
          isCorrect: false,
          feedback: "The map is not part of the code order.",
        },
      ],
    },
  ],
};

export const choiceQuiz: ChoiceQuiz = {
  question: "Which sentence is the most polite way to ask for help in the library?",
  options: [
    { id: "a", text: "Give me the code.", isCorrect: false, feedback: "That sounds demanding, not polite." },
    {
      id: "b",
      text: "Can you help me find the exit code, please?",
      isCorrect: true,
      feedback: "Correct. That is polite and clear.",
    },
    { id: "c", text: "Tell me right now.", isCorrect: false, feedback: "That is too forceful for a help request." },
    { id: "d", text: "I want the answer.", isCorrect: false, feedback: "That states a demand instead of asking politely." },
  ],
};
