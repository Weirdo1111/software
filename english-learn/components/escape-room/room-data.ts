import type { AudioPuzzle, ClueItem, ClueModalContent, DeskPuzzle, InventoryItem, ProgressTask, RoomObject } from "@/components/escape-room/types";

export const ESCAPE_ROOM_CODE = "204915";
export const ESCAPE_ROOM_COUNTDOWN_SECONDS = 300;
export const ESCAPE_ROOM_ATTEMPT_LIMIT = 3;

export const NOTICE_BOARD_CLUE: ClueItem = {
  id: "closing-time",
  label: "Closing Time",
  value: "915",
  kind: "code",
  source: "notice-board",
  description: "The main library closes at 9:15 PM.",
};

export const RETURN_CART_CLUE: ClueItem = {
  id: "history-route",
  label: "Section Lead",
  value: "HISTORY",
  kind: "intel",
  source: "return-cart",
  description: "The reshelving slip points to the Campus History stacks.",
};

export const BOOKSHELF_CLUE: ClueItem = {
  id: "history-shelf",
  label: "Shelf Code",
  value: "204",
  kind: "code",
  source: "bookshelf",
  description: "Campus History is filed at Shelf 204.",
};

export const FLOOR_MAP_CLUE: ClueItem = {
  id: "entry-format",
  label: "Entry Format",
  value: "6 DIGITS",
  kind: "intel",
  source: "floor-map",
  description: "The emergency keypad accepts one continuous 6-digit entry.",
};

export const RESHELVING_SLIP_ITEM: InventoryItem = {
  id: "reshelving-slip",
  label: "Reshelving Slip",
  value: "Campus History",
  source: "return-cart",
  description: "A late-return slip tells you which section to inspect next.",
  used: false,
};

export const DESK_KEY_ITEM: InventoryItem = {
  id: "desk-key",
  label: "Desk Key",
  value: "Drawer 04",
  source: "bookshelf",
  description: "A brass key hidden behind the history atlas unlocks the circulation drawer.",
  used: false,
};

export const PROCEDURE_CARD_ITEM: InventoryItem = {
  id: "procedure-card",
  label: "Procedure Card",
  value: "STACK FIRST",
  source: "circulation-desk",
  description: "The after-hours exit card says to enter the stack code first.",
  used: false,
};

export const NOTICE_BOARD_NOTE = "Closing memo logged: the main library shuts at 9:15 PM.";
export const RETURN_CART_NOTE = "Reshelving slip: tonight's misplaced return belongs in Campus History.";
export const BOOKSHELF_NOTE = "Shelf 204 holds the campus history atlas and a brass drawer key.";
export const DESK_NOTE = "After-hours card: start with the stack code before the final PA confirmation.";
export const SPEAKER_NOTE = "Broadcast confirms the closing time comes second.";
export const FLOOR_MAP_NOTE = "Floor map legend: the keypad expects one continuous 6-digit entry.";

export const QUEST_REWARD = {
  xpEarned: 50,
  badgeUnlocked: "Midnight Reader",
};

export const roomObjects: RoomObject[] = [
  {
    id: "notice-board",
    name: "Notice Board",
    shortLabel: "Read",
    description: "Check the late-night notices and find the real closing memo.",
    hotspot: { left: "76%", top: "35%" },
    modalType: "clue",
    required: true,
    accent: "bg-amber-500/90",
  },
  {
    id: "return-cart",
    name: "Return Cart",
    shortLabel: "Search",
    description: "Find the slip that tells you where the missing return belongs.",
    hotspot: { left: "46%", top: "60%" },
    modalType: "clue",
    required: true,
    accent: "bg-rose-500/90",
  },
  {
    id: "bookshelf",
    name: "History Stacks",
    shortLabel: "Inspect",
    description: "Use the cart lead to locate the correct shelf marker in the stacks.",
    hotspot: { left: "45%", top: "41%" },
    modalType: "clue",
    required: true,
    accent: "bg-sky-500/90",
  },
  {
    id: "circulation-desk",
    name: "Circulation Desk",
    shortLabel: "Unlock",
    description: "Use the brass key and check the after-hours procedure drawer.",
    hotspot: { left: "20%", top: "50%" },
    modalType: "desk",
    required: true,
    accent: "bg-emerald-500/90",
  },
  {
    id: "speaker",
    name: "Overhead Speaker",
    shortLabel: "Listen",
    description: "Replay the final PA announcement to confirm the second half of the code.",
    hotspot: { left: "72%", top: "9%" },
    modalType: "audio",
    required: true,
    accent: "bg-violet-500/90",
  },
  {
    id: "floor-map",
    name: "Floor Map",
    shortLabel: "Verify",
    description: "Check the wall map to confirm the keypad format before you leave.",
    hotspot: { left: "61%", top: "34%" },
    modalType: "clue",
    required: true,
    accent: "bg-teal-500/90",
  },
  {
    id: "exit-door",
    name: "Exit Door",
    shortLabel: "Unlock",
    description: "Enter the final code and leave the library.",
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
    supportText: "Find the real memo on the board and log the library closing time.",
  },
  {
    id: "return-cart",
    label: "Recover the cart slip",
    supportText: "Search the return cart for the lead that tells you which section to inspect next.",
  },
  {
    id: "bookshelf",
    label: "Search the history stacks",
    supportText: "Locate the correct shelf marker and recover the brass desk key.",
  },
  {
    id: "circulation-desk",
    label: "Open the circulation drawer",
    supportText: "Use the desk key and identify the correct after-hours procedure card.",
  },
  {
    id: "speaker",
    label: "Confirm the PA announcement",
    supportText: "Use the broadcast to verify which clue comes second in the exit sequence.",
  },
  {
    id: "floor-map",
    label: "Verify keypad format",
    supportText: "Check the floor map and confirm how the final code must be entered.",
  },
];

export const clueModalContent: Record<"notice-board" | "bookshelf" | "floor-map" | "return-cart", ClueModalContent> = {
  "notice-board": {
    id: "notice-board",
    title: "Closing Notice",
    subtitle: "Zoom in on the board and identify the notice that controls the library's lock cycle.",
    headline: "Main Library closes at 9:15 PM",
    body: "The wall board mixes events, quiet-zone reminders, and service notes. The closing memo is the only time fragment you should log for the exit code.",
    lines: [
      "Main Library closes at 9:15 PM after the final circulation check",
      "Emergency exit access is restricted after closing",
      "Quiet-floor sweep begins after the lock cycle",
      "Ask front-desk staff before the final lock if you need help",
    ],
    clue: NOTICE_BOARD_CLUE,
    investigation: {
      visualStyle: "board",
      prompt: "Choose the official closing memo, not an event poster or a quiet-zone reminder.",
      targets: [
        {
          id: "events",
          label: "Library Events",
          detail: "Poetry reading begins at 8:45 PM in seminar room C",
          isCorrect: false,
        },
        {
          id: "closing",
          label: "Closing Memo",
          detail: "Main Library closes at 9:15 PM after the final circulation check",
          isCorrect: true,
        },
        {
          id: "quiet-zone",
          label: "Quiet Zone",
          detail: "Silent study sweep begins at 9:20 PM on level 2",
          isCorrect: false,
        },
        {
          id: "research-support",
          label: "Research Support",
          detail: "Citation desk opens at 9:00 AM on weekdays",
          isCorrect: false,
        },
      ],
      question: "Which time belongs in your notebook for the exit code?",
      options: [
        { id: "915", text: "9:15 PM", isCorrect: true, feedback: "Correct. The closing memo gives you 9:15 PM." },
        { id: "920", text: "9:20 PM", isCorrect: false, feedback: "That belongs to the quiet-zone sweep, not the closing memo." },
        { id: "900", text: "9:00 AM", isCorrect: false, feedback: "That time is from the research-support poster." },
        { id: "845", text: "8:45 PM", isCorrect: false, feedback: "That is the event start time, not the closing time." },
      ],
    },
  },
  "return-cart": {
    id: "return-cart",
    title: "Return Cart",
    subtitle: "Search the slip stack and recover the lead that points to the correct section.",
    headline: "The missing return belongs in Campus History",
    body: "One slip matters because it tells you which shelf family to inspect next. The others are valid library paperwork, but they will waste your run.",
    lines: [
      "Late return: Campus History Atlas",
      "Reshelve before lights out",
      "Do not send this copy to Science Reference",
      "Place the final cart back by circulation after filing",
    ],
    clue: RETURN_CART_CLUE,
    investigation: {
      visualStyle: "shelf",
      prompt: "Pick the cart slip that redirects the missing book to Campus History, not Science, Media, or Literature.",
      targets: [
        {
          id: "science-slip",
          label: "Science Reference",
          detail: "Lab manual hold - Science Reference annex",
          isCorrect: false,
        },
        {
          id: "history-slip",
          label: "Campus History",
          detail: "Late return: Campus History Atlas - reshelve in History stacks",
          isCorrect: true,
        },
        {
          id: "media-slip",
          label: "Media Desk",
          detail: "DVD return - send to Media Services cabinet",
          isCorrect: false,
        },
        {
          id: "lit-slip",
          label: "Literature Row",
          detail: "Poetry reserve - store on Literature hold shelf",
          isCorrect: false,
        },
      ],
      question: "Which section should you inspect next?",
      options: [
        { id: "history", text: "Campus History", isCorrect: true, feedback: "Correct. The cart slip sends you to the history stacks." },
        { id: "science", text: "Science Reference", isCorrect: false, feedback: "The slip explicitly says not to send the atlas there." },
        { id: "media", text: "Media Services", isCorrect: false, feedback: "That is a different return workflow." },
        { id: "literature", text: "Literature Row", isCorrect: false, feedback: "That lead belongs to a different hold request." },
      ],
    },
  },
  bookshelf: {
    id: "bookshelf",
    title: "History Stacks",
    subtitle: "Zoom in on the stack markers and recover the shelf code tied to Campus History.",
    headline: "Campus History - Shelf 204",
    body: "The shelf marker gives you the first code fragment. Hidden behind the history atlas is a brass key for the circulation drawer.",
    lines: [
      "Campus History - Shelf 204",
      "Science Reference - Shelf 214",
      "Reserve Reading - Shelf 206",
      "Atlas volume tagged for return cart pickup",
    ],
    clue: BOOKSHELF_CLUE,
    investigation: {
      visualStyle: "shelf",
      prompt: "Follow the cart slip and choose the Campus History marker, not the nearby reserve or science labels.",
      targets: [
        {
          id: "science-214",
          label: "Science Reference",
          detail: "Shelf 214 - lab reports and citation manuals",
          isCorrect: false,
        },
        {
          id: "history-204",
          label: "Campus History",
          detail: "Shelf 204 - university archives and campus history",
          isCorrect: true,
        },
        {
          id: "reserve-206",
          label: "Reserve Reading",
          detail: "Shelf 206 - professor packets and reserve copies",
          isCorrect: false,
        },
        {
          id: "lit-240",
          label: "Literature Row",
          detail: "Shelf 240 - drama and criticism",
          isCorrect: false,
        },
      ],
      question: "Which shelf code should be recorded from the history marker?",
      options: [
        { id: "204", text: "204", isCorrect: true, feedback: "Correct. Campus History is filed at Shelf 204." },
        { id: "214", text: "214", isCorrect: false, feedback: "That belongs to Science Reference." },
        { id: "206", text: "206", isCorrect: false, feedback: "That belongs to the reserve shelf." },
        { id: "240", text: "240", isCorrect: false, feedback: "That number belongs to Literature Row." },
      ],
    },
  },
  "floor-map": {
    id: "floor-map",
    title: "Emergency Route Map",
    subtitle: "Check the wall map and confirm the keypad rules before you leave.",
    headline: "One continuous 6-digit entry",
    body: "The map does not reveal a new number, but it does tell you exactly how the exit console expects the final code.",
    lines: [
      "Emergency keypad accepts one continuous 6-digit entry",
      "Use the west-hall exit after the final lock cycle",
      "Front desk verification ends before the final lock",
      "Do not split the code with spaces or symbols",
    ],
    clue: FLOOR_MAP_CLUE,
  },
};

export const circulationDeskPuzzle: DeskPuzzle = {
  requiredItemId: DESK_KEY_ITEM.id,
  prompt: "The drawer contains several procedure cards. Choose the one that actually controls the emergency exit, not printer repair or fee processing.",
  records: [
    {
      id: "printer-reset",
      tab: "Printer Reset",
      detail: "Reconnect the circulation printer before the morning shift.",
      isCorrect: false,
    },
    {
      id: "exit-procedure",
      tab: "After-hours Exit",
      detail: "Emergency exit procedure: begin with the stack code, then wait for final PA confirmation.",
      isCorrect: true,
    },
    {
      id: "late-fees",
      tab: "Late Fees",
      detail: "Payment disputes must be logged before 8 PM.",
      isCorrect: false,
    },
    {
      id: "study-rooms",
      tab: "Study Rooms",
      detail: "Group study rooms auto-lock after the last reservation block.",
      isCorrect: false,
    },
  ],
  question: "Which rule belongs in your notebook before you check the broadcast?",
  options: [
    {
      id: "stack-first",
      text: "Use the stack code first.",
      isCorrect: true,
      feedback: "Correct. The procedure card tells you the stack code must come first.",
    },
    {
      id: "time-first",
      text: "Use the closing time first.",
      isCorrect: false,
      feedback: "That reverses the procedure. The drawer note says to begin with the stack code.",
    },
    {
      id: "key-first",
      text: "Use the drawer key first.",
      isCorrect: false,
      feedback: "The key opens the drawer, but it is not part of the exit code.",
    },
    {
      id: "map-first",
      text: "Use the floor map number first.",
      isCorrect: false,
      feedback: "The map confirms the format, not the first code fragment.",
    },
  ],
};

export const speakerPuzzle: AudioPuzzle = {
  prompt: "Attention, visitors. The final exit code uses the history shelf number first, then the closing time.",
  instruction: "Listen to the PA message. It confirms the second half of the sequence and reminds you where help was available before the final lock.",
  src: "/quests/escape-room/audio/library-announcement.wav",
  transcript:
    "Attention, visitors. The library will close at 9:15 p.m. The final exit code uses the history shelf number first, then the closing time. Please make your way to the front desk if you need help before leaving.",
  clueValue: "TIME SECOND",
  steps: [
    {
      id: "announcement-order",
      question: "What does the announcement say to use second?",
      answerId: "closing-time",
      options: [
        { id: "stack-code", text: "The stack code", isCorrect: false, feedback: "The broadcast says the stack code comes first, not second." },
        { id: "closing-time", text: "The closing time", isCorrect: true, feedback: "Correct. The closing time comes second." },
        { id: "desk-key", text: "The desk key", isCorrect: false, feedback: "The key is not part of the final entry." },
        { id: "map-note", text: "The map note", isCorrect: false, feedback: "The map only confirms the format." },
      ],
    },
    {
      id: "sequence-check",
      question: "Which sequence matches the drawer card and the announcement together?",
      answerId: "stack-then-time",
      options: [
        {
          id: "stack-then-time",
          text: "Stack code first, then closing time",
          isCorrect: true,
          feedback: "Correct. Combine 204 first and 915 second.",
        },
        {
          id: "time-then-stack",
          text: "Closing time first, then stack code",
          isCorrect: false,
          feedback: "That reverses the order confirmed by both clues.",
        },
        {
          id: "map-then-stack",
          text: "Map format first, then stack code",
          isCorrect: false,
          feedback: "The format note is not a number fragment.",
        },
        {
          id: "key-then-time",
          text: "Desk key first, then closing time",
          isCorrect: false,
          feedback: "The key is a tool, not part of the code.",
        },
      ],
    },
    {
      id: "help-point",
      question: "Where did the announcement say visitors should go if they still needed help?",
      answerId: "front-desk",
      options: [
        {
          id: "front-desk",
          text: "The front desk",
          isCorrect: true,
          feedback: "Correct. The PA message points to the front desk.",
        },
        {
          id: "science-wing",
          text: "The science wing",
          isCorrect: false,
          feedback: "The science wing is not mentioned in the announcement.",
        },
        {
          id: "archive-stairs",
          text: "The archive stairs",
          isCorrect: false,
          feedback: "Those stairs are not part of the exit instruction.",
        },
        {
          id: "quiet-room",
          text: "The quiet room",
          isCorrect: false,
          feedback: "That room is not the help point named in the announcement.",
        },
      ],
    },
  ],
};
