import type { AudioPuzzle, ClueItem, ClueModalContent, DeskPuzzle, InventoryItem, ProgressTask, RoomObject } from "@/components/escape-room/types";

export const DORM_LOCKOUT_CODE = "1051045";
export const DORM_LOCKOUT_COUNTDOWN_SECONDS = 360;
export const DORM_LOCKOUT_ATTEMPT_LIMIT = 3;

export const DORM_NOTICE_CLUE: ClueItem = {
  id: "quiet-hours-time",
  label: "Quiet Hours",
  value: "1045",
  kind: "code",
  source: "notice-board",
  description: "Quiet hours begin at 10:45 PM.",
};

export const DORM_CUBBY_CLUE: ClueItem = {
  id: "resident-unit",
  label: "Unit Number",
  value: "105",
  kind: "code",
  source: "return-cart",
  description: "The returned access pass belongs to Unit 105.",
};

export const DORM_BACKPACK_CLUE: ClueItem = {
  id: "pass-located",
  label: "Pass Lead",
  value: "PASS READY",
  kind: "intel",
  source: "bookshelf",
  description: "The matching backpack contains the RA access pass.",
};

export const DORM_HANDBOOK_CLUE: ClueItem = {
  id: "hall-format",
  label: "Entry Format",
  value: "7 DIGITS",
  kind: "intel",
  source: "floor-map",
  description: "The hall keypad accepts one continuous 7-digit entry.",
};

export const UNIT_MAIL_SLIP_ITEM: InventoryItem = {
  id: "mail-slip",
  label: "Mail Slip",
  value: "Unit 105",
  source: "return-cart",
  description: "A late-access return slip points you to the matching resident bag.",
  used: false,
};

export const RA_PASS_ITEM: InventoryItem = {
  id: "ra-pass",
  label: "RA Passcard",
  value: "Desk Access",
  source: "bookshelf",
  description: "A returned RA passcard unlocks the after-hours desk drawer.",
  used: false,
};

export const HALL_ACCESS_CARD_ITEM: InventoryItem = {
  id: "hall-access-card",
  label: "Hall Access Card",
  value: "UNIT FIRST",
  source: "circulation-desk",
  description: "The resident log card says to enter the unit number first.",
  used: false,
};

export const DORM_NOTICE_NOTE = "Quiet-hours notice logged: the hall shifts into quiet hours at 10:45 PM.";
export const DORM_CUBBY_NOTE = "Resident cubby match: the returned pass is filed under Unit 105.";
export const DORM_BACKPACK_NOTE = "Matching bag opened: the RA passcard was tucked inside the Unit 105 backpack.";
export const DORM_DESK_NOTE = "After-hours hall access card logged: start with the unit number.";
export const DORM_INTERCOM_NOTE = "Intercom confirms the quiet-hours time comes second.";
export const DORM_HANDBOOK_NOTE = "Resident handbook note: the keypad expects one continuous 7-digit entry.";

export const DORM_REWARD = {
  xpEarned: 60,
  badgeUnlocked: "Night Owl Resident",
};

export const dormRoomObjects: RoomObject[] = [
  {
    id: "notice-board",
    name: "Dorm Notice Board",
    shortLabel: "Read",
    description: "Check the board for the real quiet-hours notice.",
    hotspot: { left: "37%", top: "34%" },
    modalType: "clue",
    required: true,
    accent: "bg-amber-500/90",
  },
  {
    id: "return-cart",
    name: "Unit Cubbies",
    shortLabel: "Inspect",
    description: "Search the resident cubbies for the correct unit lead.",
    hotspot: { left: "39%", top: "56%" },
    modalType: "clue",
    required: true,
    accent: "bg-sky-500/90",
    iconKey: "archive",
  },
  {
    id: "bookshelf",
    name: "Backpack Pile",
    shortLabel: "Search",
    description: "Match the resident bag and recover the returned passcard.",
    hotspot: { left: "52%", top: "71%" },
    modalType: "clue",
    required: true,
    accent: "bg-rose-500/90",
    iconKey: "backpack",
  },
  {
    id: "circulation-desk",
    name: "RA Desk",
    shortLabel: "Unlock",
    description: "Use the passcard and read the after-hours desk log.",
    hotspot: { left: "72%", top: "57%" },
    modalType: "desk",
    required: true,
    accent: "bg-emerald-500/90",
  },
  {
    id: "speaker",
    name: "Hall Intercom",
    shortLabel: "Listen",
    description: "Replay the late-night dorm announcement.",
    hotspot: { left: "55%", top: "35%" },
    modalType: "audio",
    required: true,
    accent: "bg-violet-500/90",
  },
  {
    id: "floor-map",
    name: "Resident Handbook",
    shortLabel: "Verify",
    description: "Check the handbook and confirm the keypad format.",
    hotspot: { left: "68%", top: "81%" },
    modalType: "clue",
    required: true,
    accent: "bg-teal-500/90",
    iconKey: "notebook",
  },
  {
    id: "exit-door",
    name: "Hallway Exit",
    shortLabel: "Unlock",
    description: "Enter the final dorm code and leave the lounge.",
    hotspot: { left: "92%", top: "36%" },
    modalType: "keypad",
    required: true,
    accent: "bg-[var(--navy)]",
  },
];

export const dormProgressTasks: ProgressTask[] = [
  {
    id: "notice-board",
    label: "Read the quiet-hours notice",
    supportText: "Find the real dorm notice and record the quiet-hours time.",
  },
  {
    id: "return-cart",
    label: "Inspect the unit cubbies",
    supportText: "Recover the correct resident unit number from the storage cubbies.",
  },
  {
    id: "bookshelf",
    label: "Search the backpack pile",
    supportText: "Match the resident bag and recover the returned RA passcard.",
  },
  {
    id: "circulation-desk",
    label: "Open the RA desk",
    supportText: "Use the passcard and log the after-hours hall access card.",
  },
  {
    id: "speaker",
    label: "Listen to the intercom",
    supportText: "Confirm which clue must come second in the final door code.",
  },
  {
    id: "floor-map",
    label: "Verify the handbook format",
    supportText: "Check the resident handbook and confirm how the code must be entered.",
  },
];

export const dormClueModalContent: Record<"notice-board" | "bookshelf" | "floor-map" | "return-cart", ClueModalContent> = {
  "notice-board": {
    id: "notice-board",
    title: "Dorm Notice Board",
    subtitle: "Zoom in on the board and identify the notice that matters for late-night hall access.",
    headline: "Quiet hours begin at 10:45 PM",
    body: "The dorm board mixes laundry reminders, event flyers, and resident notices. The quiet-hours notice is the only time clue you should record for the hallway code.",
    lines: [
      "Quiet hours begin at 10:45 PM",
      "Late access cards are sorted by resident unit number",
      "Laundry room closes at 11:00 PM",
      "RA desk support ends before the final lock cycle",
    ],
    clue: DORM_NOTICE_CLUE,
    investigation: {
      visualStyle: "board",
      prompt: "Choose the quiet-hours notice, not the laundry rule or the student events flyer.",
      targets: [
        {
          id: "laundry",
          label: "Laundry Room Rules",
          detail: "Last dryer cycle begins at 11:00 PM",
          isCorrect: false,
        },
        {
          id: "quiet-hours",
          label: "Quiet Hours",
          detail: "Quiet hours begin at 10:45 PM for the residence hall",
          isCorrect: true,
        },
        {
          id: "events",
          label: "Student Events",
          detail: "Movie night starts at 8:30 PM in the lounge",
          isCorrect: false,
        },
        {
          id: "office-hours",
          label: "RA Office",
          detail: "Day desk support begins at 8:00 AM",
          isCorrect: false,
        },
      ],
      question: "Which time should be recorded for the hallway code?",
      options: [
        { id: "1045", text: "10:45 PM", isCorrect: true, feedback: "Correct. Quiet hours begin at 10:45 PM." },
        { id: "1100", text: "11:00 PM", isCorrect: false, feedback: "That belongs to the laundry room schedule." },
        { id: "830", text: "8:30 PM", isCorrect: false, feedback: "That is the student event start time." },
        { id: "800", text: "8:00 AM", isCorrect: false, feedback: "That is the daytime office-hours note." },
      ],
    },
  },
  "return-cart": {
    id: "return-cart",
    title: "Resident Cubbies",
    subtitle: "Inspect the cubbies and identify the unit that matches the returned access slip.",
    headline: "Returned pass filed under Unit 105",
    body: "The cubbies are labeled by resident unit. One slip matters because it tells you which resident bag should hold the returned passcard.",
    lines: [
      "Returned pass filed under Unit 105",
      "Late returns sorted by unit number",
      "Check the matching resident bag before desk lock",
      "Do not send this pass to Unit 104",
    ],
    clue: DORM_CUBBY_CLUE,
    investigation: {
      visualStyle: "shelf",
      prompt: "Choose the cubby label that matches the returned pass, not the neighboring resident units.",
      targets: [
        {
          id: "unit-101",
          label: "Unit 101",
          detail: "Package hold and laundry card returns",
          isCorrect: false,
        },
        {
          id: "unit-102",
          label: "Unit 102",
          detail: "Mail and package overflow",
          isCorrect: false,
        },
        {
          id: "unit-104",
          label: "Unit 104",
          detail: "Night drop for maintenance requests",
          isCorrect: false,
        },
        {
          id: "unit-105",
          label: "Unit 105",
          detail: "Returned hall pass and resident mail slip",
          isCorrect: true,
        },
      ],
      question: "Which unit number should you record from the cubby labels?",
      options: [
        { id: "105", text: "105", isCorrect: true, feedback: "Correct. The returned pass belongs to Unit 105." },
        { id: "104", text: "104", isCorrect: false, feedback: "The slip explicitly says not to send the pass to Unit 104." },
        { id: "102", text: "102", isCorrect: false, feedback: "That cubby only holds general overflow mail." },
        { id: "101", text: "101", isCorrect: false, feedback: "That cubby is not tied to the returned hall pass." },
      ],
    },
  },
  bookshelf: {
    id: "bookshelf",
    title: "Backpack Pile",
    subtitle: "Match the correct bag to Unit 105 and recover the RA passcard inside.",
    headline: "The Unit 105 bag hides the RA passcard",
    body: "One backpack matches the cubby slip and contains the returned passcard you need for the RA desk drawer.",
    lines: [
      "Green bag tagged Unit 105",
      "Orientation folder and hall pass tucked inside",
      "Blue bag belongs to Unit 101",
      "Pink bag belongs to Unit 104",
    ],
    clue: DORM_BACKPACK_CLUE,
    investigation: {
      visualStyle: "shelf",
      prompt: "Choose the backpack that matches the Unit 105 cubby slip, not the neighboring bags.",
      targets: [
        {
          id: "blue-bag",
          label: "Blue Backpack",
          detail: "Unit 101 - textbook, charger, residence map",
          isCorrect: false,
        },
        {
          id: "pink-bag",
          label: "Pink Backpack",
          detail: "Unit 104 - laundry card and studio notes",
          isCorrect: false,
        },
        {
          id: "green-bag",
          label: "Green Backpack",
          detail: "Unit 105 - orientation folder and returned RA passcard",
          isCorrect: true,
        },
        {
          id: "desk-tote",
          label: "Desk Tote",
          detail: "Staff paperwork, not a resident bag",
          isCorrect: false,
        },
      ],
      question: "Which bag should you search to recover the desk pass?",
      options: [
        { id: "green-bag", text: "The green Unit 105 backpack", isCorrect: true, feedback: "Correct. The green Unit 105 bag contains the returned passcard." },
        { id: "pink-bag", text: "The pink Unit 104 backpack", isCorrect: false, feedback: "That bag belongs to a different resident." },
        { id: "blue-bag", text: "The blue Unit 101 backpack", isCorrect: false, feedback: "That tag does not match the cubby clue." },
        { id: "desk-tote", text: "The desk-side tote", isCorrect: false, feedback: "That is staff storage, not the resident bag from the cubby slip." },
      ],
    },
  },
  "floor-map": {
    id: "floor-map",
    title: "Resident Handbook",
    subtitle: "Check the desk handbook and confirm the hallway keypad format.",
    headline: "Keypad accepts one 7-digit entry",
    body: "The handbook does not reveal a new number, but it confirms the exact format needed by the dorm exit keypad.",
    lines: [
      "Emergency hall keypad accepts one 7-digit entry",
      "Do not add spaces, slashes, or symbols",
      "Resident unit comes before the quiet-hours time",
      "Final verification must be completed before the lock cycle",
    ],
    clue: DORM_HANDBOOK_CLUE,
  },
};

export const dormDeskPuzzle: DeskPuzzle = {
  requiredItemId: RA_PASS_ITEM.id,
  prompt: "The RA desk drawer contains several cards. Choose the after-hours hall access card, not the guest sign-out or maintenance notes.",
  records: [
    {
      id: "guest-sign-out",
      tab: "Guest Sign-Out",
      detail: "Visitors must leave before the quiet-hours sweep begins.",
      isCorrect: false,
    },
    {
      id: "hall-access",
      tab: "After-hours Hall Access",
      detail: "Hallway exit procedure: enter the resident unit first, then wait for intercom confirmation.",
      isCorrect: true,
    },
    {
      id: "maintenance",
      tab: "Maintenance",
      detail: "Submit sink and heating issues before midnight.",
      isCorrect: false,
    },
    {
      id: "laundry-log",
      tab: "Laundry Log",
      detail: "Record washer faults before the morning round.",
      isCorrect: false,
    },
  ],
  question: "Which rule belongs in your notebook before you check the intercom?",
  options: [
    {
      id: "unit-first",
      text: "Use the resident unit first.",
      isCorrect: true,
      feedback: "Correct. The hall access card says to start with the resident unit number.",
    },
    {
      id: "time-first",
      text: "Use the quiet-hours time first.",
      isCorrect: false,
      feedback: "That reverses the desk procedure. The card says to begin with the unit number.",
    },
    {
      id: "pass-first",
      text: "Use the RA passcard first.",
      isCorrect: false,
      feedback: "The passcard unlocks the drawer, but it is not part of the code.",
    },
    {
      id: "guest-first",
      text: "Use the guest sign-out number first.",
      isCorrect: false,
      feedback: "That card does not control the hallway exit.",
    },
  ],
};

export const dormSpeakerPuzzle: AudioPuzzle = {
  prompt: "Attention residents. The final hallway code uses the unit number first, then the quiet-hours time.",
  instruction: "Listen carefully. The intercom confirms the second half of the sequence and repeats where residents should go if the desk pass is missing.",
  src: "/quests/escape-room/audio/dorm-announcement.wav",
  transcript:
    "Attention residents. Quiet hours begin at 10:45 p.m. The final hallway code uses the unit number first, then the quiet-hours time. Please report to the resident assistant desk if your access pass is missing before the final lock cycle.",
  clueValue: "TIME SECOND",
  steps: [
    {
      id: "announcement-order",
      question: "What does the intercom say to use second?",
      answerId: "quiet-hours-time",
      options: [
        { id: "resident-unit", text: "The resident unit", isCorrect: false, feedback: "The unit comes first, not second." },
        { id: "quiet-hours-time", text: "The quiet-hours time", isCorrect: true, feedback: "Correct. The quiet-hours time comes second." },
        { id: "desk-pass", text: "The desk pass", isCorrect: false, feedback: "The pass unlocks the desk, but it is not part of the code." },
        { id: "laundry-time", text: "The laundry closing time", isCorrect: false, feedback: "That schedule is not part of the final code." },
      ],
    },
    {
      id: "sequence-check",
      question: "Which sequence matches the desk card and intercom together?",
      answerId: "unit-then-time",
      options: [
        {
          id: "unit-then-time",
          text: "Resident unit first, then quiet-hours time",
          isCorrect: true,
          feedback: "Correct. Use 105 first and 1045 second.",
        },
        {
          id: "time-then-unit",
          text: "Quiet-hours time first, then resident unit",
          isCorrect: false,
          feedback: "That reverses the order confirmed by both clues.",
        },
        {
          id: "pass-then-time",
          text: "Desk pass first, then quiet-hours time",
          isCorrect: false,
          feedback: "The pass opens the drawer, but it is not part of the code.",
        },
        {
          id: "laundry-then-unit",
          text: "Laundry closing time first, then resident unit",
          isCorrect: false,
          feedback: "Laundry rules are not part of the hallway code.",
        },
      ],
    },
    {
      id: "help-point",
      question: "Where should residents go if their access pass is missing before the lock cycle?",
      answerId: "ra-desk",
      options: [
        {
          id: "ra-desk",
          text: "The RA desk",
          isCorrect: true,
          feedback: "Correct. The intercom sends residents to the RA desk.",
        },
        {
          id: "laundry-room",
          text: "The laundry room",
          isCorrect: false,
          feedback: "That room is not part of the access instruction.",
        },
        {
          id: "vending-machine",
          text: "The vending machine",
          isCorrect: false,
          feedback: "The machine has nothing to do with the lock cycle.",
        },
        {
          id: "study-lounge",
          text: "The study lounge",
          isCorrect: false,
          feedback: "The intercom does not send residents there for access help.",
        },
      ],
    },
  ],
};
