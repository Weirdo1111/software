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
  description: "Campus History - Shelf 204.",
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
    description: "Check the campus notices and closing reminder on the wall board.",
    hotspot: { left: "77%", top: "35%" },
    modalType: "clue",
    required: true,
    accent: "bg-amber-500/90",
  },
  {
    id: "bookshelf",
    name: "Library Stacks",
    shortLabel: "Inspect",
    description: "Inspect the central stacks and find the history shelf number.",
    hotspot: { left: "46%", top: "44%" },
    modalType: "clue",
    required: true,
    accent: "bg-sky-500/90",
  },
  {
    id: "floor-map",
    name: "Floor Map",
    shortLabel: "Trace",
    description: "Study the emergency route and keypad notice on the desk map.",
    hotspot: { left: "61%", top: "38%" },
    modalType: "clue",
    required: false,
    accent: "bg-teal-500/90",
  },
  {
    id: "return-cart",
    name: "Return Cart",
    shortLabel: "Search",
    description: "Check the reshelving cart for any slip left by the night staff.",
    hotspot: { left: "46%", top: "62%" },
    modalType: "clue",
    required: false,
    accent: "bg-rose-500/90",
  },
  {
    id: "speaker",
    name: "Overhead Speaker",
    shortLabel: "Listen",
    description: "Replay the final library announcement.",
    hotspot: { left: "73%", top: "11%" },
    modalType: "audio",
    required: true,
    accent: "bg-violet-500/90",
  },
  {
    id: "librarian-desk-terminal",
    name: "Librarian Desk",
    shortLabel: "Ask",
    description: "Wake the librarian desk terminal and ask for help in English.",
    hotspot: { left: "18%", top: "46%" },
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
    supportText: "Read the campus notice board and identify the real library closing reminder.",
  },
  {
    id: "bookshelf",
    label: "Inspect the history shelf",
    supportText: "Search the central stacks and find the campus history shelf marker.",
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
    subtitle: "Zoom in on the wall board and identify the pinned campus notice that gives the library closing time.",
    headline: "Library closes at 9:15 PM",
    body: "The closing time looks essential, but the surrounding notes suggest the board is only one piece of a larger access routine.",
    lines: [
      "Library closes at 9:15 PM",
      "Emergency exit access is restricted",
      "Ask staff if you need help finding a section",
      "Quiet floor sweep begins at 9:20 PM",
    ],
    clue: NOTICE_BOARD_CLUE,
    investigation: {
      visualStyle: "board",
      prompt: "Pick the campus notice that tells you the main library's closing time, not an event time or a different service schedule.",
      targets: [
        {
          id: "library-events",
          label: "Library Events",
          detail: "Poetry reading begins at 8:45 PM in the media room",
          isCorrect: false,
        },
        {
          id: "library-closing",
          label: "Closing Notice",
          detail: "Main Library closes at 9:15 PM after the final circulation check",
          isCorrect: true,
        },
        {
          id: "research-tips",
          label: "Research Tips",
          detail: "Reference desk opens at 9:00 AM for citation support",
          isCorrect: false,
        },
        {
          id: "quiet-zone",
          label: "Quiet Zone",
          detail: "Silent study hours begin at 9:20 PM on level 2",
          isCorrect: false,
        },
      ],
      question: "Which time from the notice board should be recorded for the exit code?",
      options: [
        { id: "915", text: "9:15 PM", isCorrect: true, feedback: "Correct. The main library closing time is 9:15 PM." },
        { id: "920", text: "9:20 PM", isCorrect: false, feedback: "That time belongs to the quiet-zone rule, not the closing notice." },
        { id: "900", text: "9:00 AM", isCorrect: false, feedback: "That time refers to the research support schedule." },
        { id: "845", text: "8:45 PM", isCorrect: false, feedback: "That is the event start time from the library-events poster." },
      ],
    },
  },
  "bookshelf": {
    id: "bookshelf",
    title: "Stack Marker",
    subtitle: "Zoom in on the stack markers and identify the correct shelf tag for campus history.",
    headline: "Campus History - Shelf 204",
    body: "The shelf marker gives you a clean number, but the neighboring labels make it easy to choose the wrong aisle if you rush.",
    lines: [
      "Campus History - Shelf 204",
      "Science Reference - Shelf 214",
      "Level 2 Study Stacks",
      "Return books to the cart before closing",
    ],
    clue: BOOKSHELF_CLUE,
    investigation: {
      visualStyle: "shelf",
      prompt: "Choose the label that matches the campus history shelf, not the science stacks, reserve shelf, or literature row.",
      targets: [
        {
          id: "science-214",
          label: "Science Reference",
          detail: "Shelf 214 - Lab reports and research writing",
          isCorrect: false,
        },
        {
          id: "hist-204",
          label: "Campus History",
          detail: "Shelf 204 - University archives and campus history",
          isCorrect: true,
        },
        {
          id: "reserve-206",
          label: "Seminar Reserve",
          detail: "Shelf 206 - Professor course packets",
          isCorrect: false,
        },
        {
          id: "lit-240",
          label: "Literature Row",
          detail: "Shelf 240 - Drama and literary criticism",
          isCorrect: false,
        },
      ],
      question: "Which shelf code should you record from the campus history marker?",
      options: [
        { id: "204", text: "204", isCorrect: true, feedback: "Correct. The campus history marker is Shelf 204." },
        { id: "214", text: "214", isCorrect: false, feedback: "That number belongs to the science reference shelf." },
        { id: "206", text: "206", isCorrect: false, feedback: "That code belongs to the seminar reserve shelf, not campus history." },
        { id: "240", text: "240", isCorrect: false, feedback: "That is the literature row number, not the history stack." },
      ],
    },
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
