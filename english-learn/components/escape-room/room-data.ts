import type { AudioPuzzle, ChoiceQuiz, ClueItem, ClueModalContent, ProgressTask, RoomObject } from "@/components/escape-room/types";

export const ESCAPE_ROOM_CODE = "204915";
export const ESCAPE_ROOM_COUNTDOWN_SECONDS = 300;
export const ESCAPE_ROOM_ATTEMPT_LIMIT = 3;

export const NOTICE_BOARD_CLUE: ClueItem = {
  id: "closing-time",
  label: "Closing time",
  value: "915",
  kind: "code",
  source: "notice-board",
  description: "Library closes at 9:15 PM.",
};

export const BOOKSHELF_CLUE: ClueItem = {
  id: "history-shelf",
  label: "History shelf",
  value: "204",
  kind: "code",
  source: "bookshelf",
  description: "History Section - Shelf 204.",
};

export const FLOOR_MAP_CLUE: ClueItem = {
  id: "format-note",
  label: "Security format",
  value: "6 DIGITS",
  kind: "intel",
  source: "floor-map",
  description: "The emergency keypad expects one continuous six-digit entry.",
};

export const RETURN_CART_CLUE: ClueItem = {
  id: "sorting-slip",
  label: "Sorting slip",
  value: "NO GAPS",
  kind: "intel",
  source: "return-cart",
  description: "A reshelving slip warns staff not to split the final access code.",
};

export const SPEAKER_NOTE = "The announcement says to use the closing time second.";
export const LIBRARIAN_HINT = "Of course. Use the shelf number first, then the closing time.";
export const QUIZ_NOTE = "Polite requests make it easier to get help in the library.";
export const FLOOR_MAP_NOTE = "The floor map says the emergency keypad accepts one six-digit entry.";
export const RETURN_CART_NOTE = "A reshelving slip repeats: keep the shelf clue and closing time together with no spaces.";

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
    hotspot: { left: "29%", top: "34%" },
    modalType: "clue",
    required: true,
    accent: "bg-amber-500/90",
  },
  {
    id: "bookshelf",
    name: "Bookshelf",
    shortLabel: "Inspect",
    description: "Find the history shelf number.",
    hotspot: { left: "78%", top: "43%" },
    modalType: "clue",
    required: true,
    accent: "bg-sky-500/90",
  },
  {
    id: "floor-map",
    name: "Floor Map",
    shortLabel: "Trace",
    description: "Study the emergency route and keypad notice on the desk map.",
    hotspot: { left: "43%", top: "60%" },
    modalType: "clue",
    required: false,
    accent: "bg-teal-500/90",
  },
  {
    id: "return-cart",
    name: "Return Cart",
    shortLabel: "Search",
    description: "Check the reshelving cart for any slip left by the night staff.",
    hotspot: { left: "58%", top: "68%" },
    modalType: "clue",
    required: false,
    accent: "bg-rose-500/90",
  },
  {
    id: "speaker",
    name: "Speaker",
    shortLabel: "Listen",
    description: "Replay the final library announcement.",
    hotspot: { left: "58%", top: "16%" },
    modalType: "audio",
    required: true,
    accent: "bg-violet-500/90",
  },
  {
    id: "librarian-desk-terminal",
    name: "AI Librarian",
    shortLabel: "Ask",
    description: "Ask the library assistant for help in English.",
    hotspot: { left: "47%", top: "54%" },
    modalType: "dialogue",
    required: true,
    accent: "bg-emerald-500/90",
  },
  {
    id: "exit-door",
    name: "Exit Door",
    shortLabel: "Unlock",
    description: "Enter the final code to leave the library.",
    hotspot: { left: "8%", top: "39%" },
    modalType: "keypad",
    required: true,
    accent: "bg-[var(--navy)]",
  },
];

export const progressTasks: ProgressTask[] = [
  {
    id: "notice-board",
    label: "Read the closing notice",
    supportText: "Collect the closing time from the notice board and look for supporting details nearby.",
  },
  {
    id: "bookshelf",
    label: "Inspect the history shelf",
    supportText: "Find the history shelf number and compare it with any reshelving hints in the room.",
  },
  {
    id: "speaker",
    label: "Listen to the broadcast",
    supportText: "Confirm the code order and pay attention to the final exit instructions.",
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

export const clueModalContent: Record<"notice-board" | "bookshelf" | "floor-map" | "return-cart", ClueModalContent> = {
  "notice-board": {
    id: "notice-board",
    title: "Closing Notice",
    subtitle: "The board near the entrance still shows the final staff reminders.",
    headline: "Library closes at 9:15 PM",
    body: "The closing time looks essential, but the surrounding notes suggest the board is only one piece of a larger access routine.",
    lines: [
      "Library closes at 9:15 PM",
      "Emergency exit access is restricted",
      "Ask staff if you need help finding a section",
      "Quiet floor sweep begins at 9:20 PM",
    ],
    clue: NOTICE_BOARD_CLUE,
  },
  "bookshelf": {
    id: "bookshelf",
    title: "Shelf Marker",
    subtitle: "A history shelf label is still lit by the aisle lamp.",
    headline: "History Section - Shelf 204",
    body: "The shelf marker gives you a clean number, but the neighboring labels make it easy to choose the wrong aisle if you rush.",
    lines: [
      "History Section - Shelf 204",
      "History Annex - Shelf 214",
      "Level 2 Reference Area",
      "Return books to the cart before closing",
    ],
    clue: BOOKSHELF_CLUE,
  },
  "floor-map": {
    id: "floor-map",
    title: "Emergency Floor Map",
    subtitle: "A laminated map on the desk shows the late-night exit procedure.",
    headline: "Keypad accepts one 6-digit entry",
    body: "This does not give you a number, but it rules out dashes, spaces, and split entry formats. That should matter later.",
    lines: [
      "West Hall -> Emergency Exit",
      "Security keypad accepts one 6-digit entry",
      "Front desk support remains online until final lock cycle",
      "Archive stairwell closed after 9:00 PM",
    ],
    clue: FLOOR_MAP_CLUE,
  },
  "return-cart": {
    id: "return-cart",
    title: "Reshelving Cart",
    subtitle: "A sorting slip is tucked beneath a stack of late returns.",
    headline: "Keep the final code together",
    body: "The note does not reveal a new number, but it confirms the final code should be entered as one unbroken string.",
    lines: [
      "Tonight's sweep: History 204 first",
      "Pair shelf clue with closing time",
      "Do not split the final access code",
      "Clear cart before lights out",
    ],
    clue: RETURN_CART_CLUE,
  },
};

export const speakerPuzzle: AudioPuzzle = {
  prompt: "Attention, visitors. The final exit code uses the history shelf number first, then the closing time.",
  instruction:
    "Listen carefully. The broadcast confirms the clue order and repeats where stranded visitors should go for help before the lock cycle begins.",
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
    {
      id: "help-point",
      question: "Where should visitors go if they still need help before leaving?",
      answerId: "front-desk",
      options: [
        {
          id: "front-desk",
          text: "The front desk",
          isCorrect: true,
          feedback: "Correct. The announcement sends visitors to the front desk for last-minute help.",
        },
        {
          id: "science-wing",
          text: "The science wing",
          isCorrect: false,
          feedback: "The broadcast never mentions the science wing.",
        },
        {
          id: "study-room",
          text: "The study room",
          isCorrect: false,
          feedback: "That room is not part of the exit instruction.",
        },
        {
          id: "archive-stairs",
          text: "The archive stairs",
          isCorrect: false,
          feedback: "Those stairs are not the place named in the broadcast.",
        },
      ],
    },
  ],
};

export const choiceQuiz: ChoiceQuiz = {
  question: "Which sentence is the most polite and specific way to ask for help in the library?",
  options: [
    { id: "a", text: "Give me the code.", isCorrect: false, feedback: "That sounds demanding, not polite." },
    {
      id: "b",
      text: "Could you help me confirm the exit code order, please?",
      isCorrect: true,
      feedback: "Correct. That request is polite, specific, and sounds natural.",
    },
    { id: "c", text: "Tell me right now.", isCorrect: false, feedback: "That is too forceful for a help request." },
    { id: "d", text: "I need the answer now, okay?", isCorrect: false, feedback: "That still sounds like a demand instead of a polite request." },
  ],
};
