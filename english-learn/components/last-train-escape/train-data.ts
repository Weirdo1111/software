import type { AudioPuzzle, ClueItem, ClueModalContent, DeskPuzzle, InventoryItem, ProgressTask, RoomObject } from "@/components/escape-room/types";

export const LAST_TRAIN_CODE = "4121140";
export const LAST_TRAIN_COUNTDOWN_SECONDS = 420;
export const LAST_TRAIN_ATTEMPT_LIMIT = 3;

export const TRAIN_BOARD_CLUE: ClueItem = {
  id: "line-number",
  label: "Line Number",
  value: "412",
  kind: "code",
  source: "notice-board",
  description: "The last campus shuttle to Central Hub runs on Line 412.",
};

export const TRAIN_KIOSK_CLUE: ClueItem = {
  id: "seat-claim",
  label: "Seat Claim",
  value: "SEAT B2",
  kind: "intel",
  source: "return-cart",
  description: "The reissue slip points you to Seat B2 on the platform bench.",
};

export const TRAIN_BENCH_CLUE: ClueItem = {
  id: "departure-time",
  label: "Departure Time",
  value: "1140",
  kind: "code",
  source: "bookshelf",
  description: "The matching bench bag contains the last departure stub for 11:40 PM.",
};

export const TRAIN_SIGN_CLUE: ClueItem = {
  id: "gate-format",
  label: "Gate Format",
  value: "7 DIGITS",
  kind: "intel",
  source: "floor-map",
  description: "The platform gate accepts one continuous 7-digit manual entry.",
};

export const TRANSFER_SLIP_ITEM: InventoryItem = {
  id: "transfer-slip",
  label: "Transfer Slip",
  value: "Seat B2",
  source: "return-cart",
  description: "The kiosk reissue slip tells you exactly which bench seat to inspect.",
  used: false,
};

export const SERVICE_TOKEN_ITEM: InventoryItem = {
  id: "service-token",
  label: "Service Token",
  value: "Booth Access",
  source: "bookshelf",
  description: "The matching commuter bag contains a service token for the station booth drawer.",
  used: false,
};

export const GATE_OVERRIDE_CARD_ITEM: InventoryItem = {
  id: "gate-override-card",
  label: "Gate Override Card",
  value: "LINE FIRST",
  source: "circulation-desk",
  description: "The booth override card says to enter the line number first.",
  used: false,
};

export const TRAIN_BOARD_NOTE = "Transit board logged: the final Central Hub service tonight is Line 412.";
export const TRAIN_KIOSK_NOTE = "Ticket kiosk printed: the transfer reissue slip points to Seat B2.";
export const TRAIN_BENCH_NOTE = "Platform bench searched: the matching bag held the booth token and 11:40 departure stub.";
export const TRAIN_DESK_NOTE = "Service booth override card logged: start with the line number.";
export const TRAIN_SPEAKER_NOTE = "PA system confirms the departure time comes second.";
export const TRAIN_SIGN_NOTE = "Gate signage confirms the keypad expects one continuous 7-digit entry.";

export const LAST_TRAIN_REWARD = {
  xpEarned: 70,
  badgeUnlocked: "Last Train Rider",
};

export const trainRoomObjects: RoomObject[] = [
  {
    id: "notice-board",
    name: "Transit Information Board",
    shortLabel: "Read",
    description: "Inspect the route board and identify the final campus line.",
    hotspot: { left: "20%", top: "45%" },
    modalType: "clue",
    required: true,
    accent: "bg-amber-500/90",
  },
  {
    id: "return-cart",
    name: "Ticket Kiosk",
    shortLabel: "Print",
    description: "Recover the correct reissue slip for the last Central Hub service.",
    hotspot: { left: "10%", top: "60%" },
    modalType: "clue",
    required: true,
    accent: "bg-sky-500/90",
    iconKey: "ticket",
  },
  {
    id: "bookshelf",
    name: "Bench Bags",
    shortLabel: "Search",
    description: "Match the correct seat and recover the service token from the bag.",
    hotspot: { left: "51%", top: "69%" },
    modalType: "clue",
    required: true,
    accent: "bg-rose-500/90",
    iconKey: "briefcase",
  },
  {
    id: "circulation-desk",
    name: "Service Booth",
    shortLabel: "Unlock",
    description: "Use the service token and read the booth override card.",
    hotspot: { left: "76%", top: "56%" },
    modalType: "desk",
    required: true,
    accent: "bg-emerald-500/90",
  },
  {
    id: "speaker",
    name: "Overhead Speaker",
    shortLabel: "Listen",
    description: "Replay the station announcement before the gate seals.",
    hotspot: { left: "8%", top: "13%" },
    modalType: "audio",
    required: true,
    accent: "bg-violet-500/90",
  },
  {
    id: "floor-map",
    name: "Gate Sign Array",
    shortLabel: "Verify",
    description: "Read the overhead exit signage and confirm the keypad format.",
    hotspot: { left: "50%", top: "28%" },
    modalType: "clue",
    required: true,
    accent: "bg-teal-500/90",
    iconKey: "signpost",
  },
  {
    id: "exit-door",
    name: "Platform Exit Gate",
    shortLabel: "Unlock",
    description: "Enter the final station code and clear the gate.",
    hotspot: { left: "92%", top: "57%" },
    modalType: "keypad",
    required: true,
    accent: "bg-[var(--navy)]",
  },
];

export const trainProgressTasks: ProgressTask[] = [
  {
    id: "notice-board",
    label: "Read the transit board",
    supportText: "Identify the last campus line heading to Central Hub.",
  },
  {
    id: "return-cart",
    label: "Print the kiosk slip",
    supportText: "Recover the right reissue slip and log the matching bench seat.",
  },
  {
    id: "bookshelf",
    label: "Search the bench bags",
    supportText: "Match the seat claim, recover the booth token, and record the departure time.",
  },
  {
    id: "circulation-desk",
    label: "Open the service booth",
    supportText: "Use the token and log the override card that controls the gate order.",
  },
  {
    id: "speaker",
    label: "Listen to the platform announcement",
    supportText: "Confirm which clue comes second in the final gate code.",
  },
  {
    id: "floor-map",
    label: "Verify the gate signage",
    supportText: "Confirm how many digits the platform gate expects.",
  },
];

export const trainClueModalContent: Record<"notice-board" | "bookshelf" | "floor-map" | "return-cart", ClueModalContent> = {
  "notice-board": {
    id: "notice-board",
    title: "Transit Information Board",
    subtitle: "Scan the board and isolate the last Central Hub service from the earlier route listings.",
    headline: "Final Central Hub service: Line 412",
    body: "The station board mixes commuter routes, shuttle loops, and earlier departures. Only one line still connects to Central Hub after the late-night campus transfer window.",
    lines: [
      "Central Hub late shuttle: Line 412",
      "Line 318 finishes before the final gate cycle",
      "Boarding reissues must be printed at the ticket kiosk",
      "Platform gate seals after the final boarding announcement",
    ],
    clue: TRAIN_BOARD_CLUE,
    investigation: {
      visualStyle: "board",
      prompt: "Choose the final Central Hub line, not the earlier commuter routes.",
      targets: [
        {
          id: "line-205",
          label: "Line 205",
          detail: "Day loop shuttle for the west lecture halls",
          isCorrect: false,
        },
        {
          id: "line-318",
          label: "Line 318",
          detail: "Residence shuttle ending before the last gate cycle",
          isCorrect: false,
        },
        {
          id: "line-412",
          label: "Line 412",
          detail: "Late Central Hub service departing after the platform check",
          isCorrect: true,
        },
        {
          id: "line-520",
          label: "Line 520",
          detail: "Morning express service, inactive tonight",
          isCorrect: false,
        },
      ],
      question: "Which line number belongs to the final Central Hub shuttle?",
      options: [
        { id: "412", text: "412", isCorrect: true, feedback: "Correct. Line 412 is the last Central Hub shuttle tonight." },
        { id: "318", text: "318", isCorrect: false, feedback: "Line 318 ends before the final gate cycle." },
        { id: "205", text: "205", isCorrect: false, feedback: "That route is only a daytime campus loop." },
        { id: "520", text: "520", isCorrect: false, feedback: "That service is not active tonight." },
      ],
    },
  },
  "return-cart": {
    id: "return-cart",
    title: "Ticket Kiosk",
    subtitle: "Print the correct reissue slip for the final Line 412 boarding window.",
    headline: "Reissue slip: Seat B2",
    body: "The kiosk offers several claim slips, but only one matches the final line you just logged. That slip tells you which bench bag to inspect next.",
    lines: [
      "Line 412 reissue claim - Seat B2",
      "Seat C4 belongs to the residence shuttle",
      "Seat A1 is tied to an earlier daytime route",
      "Bring the correct claim to the platform bench area",
    ],
    clue: TRAIN_KIOSK_CLUE,
    investigation: {
      visualStyle: "board",
      prompt: "Choose the reissue slip that matches Line 412, not the neighboring route receipts.",
      targets: [
        {
          id: "seat-a1",
          label: "Seat A1",
          detail: "Printed for Line 205 daytime campus loop",
          isCorrect: false,
        },
        {
          id: "seat-b2",
          label: "Seat B2",
          detail: "Printed for Line 412 Central Hub late shuttle",
          isCorrect: true,
        },
        {
          id: "seat-c4",
          label: "Seat C4",
          detail: "Printed for Line 318 residence transfer",
          isCorrect: false,
        },
        {
          id: "seat-d1",
          label: "Seat D1",
          detail: "Maintenance test print, not a boarding slip",
          isCorrect: false,
        },
      ],
      question: "Which seat claim should you record before searching the benches?",
      options: [
        { id: "b2", text: "Seat B2", isCorrect: true, feedback: "Correct. The Line 412 reissue slip points to Seat B2." },
        { id: "c4", text: "Seat C4", isCorrect: false, feedback: "That slip belongs to the residence shuttle, not the final Central Hub line." },
        { id: "a1", text: "Seat A1", isCorrect: false, feedback: "That is a daytime route receipt." },
        { id: "d1", text: "Seat D1", isCorrect: false, feedback: "That printout is only a maintenance check." },
      ],
    },
  },
  bookshelf: {
    id: "bookshelf",
    title: "Bench Bags",
    subtitle: "Match the Seat B2 claim to the correct platform bag and recover what is inside.",
    headline: "Service token recovered with the 11:40 departure stub",
    body: "Only one bench bag matches the kiosk claim and the final line. It contains both the station service token and the last departure time you still need for the gate.",
    lines: [
      "Seat B2 duffel - Line 412 folder and booth token",
      "Departure stub stamped 11:40 PM",
      "Seat C4 tote belongs to the residence shuttle",
      "Seat A1 backpack belongs to an earlier daytime loop",
    ],
    clue: TRAIN_BENCH_CLUE,
    investigation: {
      visualStyle: "shelf",
      prompt: "Choose the bag tagged for Seat B2 on Line 412, not the neighboring commuter bags.",
      targets: [
        {
          id: "a1-backpack",
          label: "Seat A1 Backpack",
          detail: "Line 205 campus loop notes and coffee receipt",
          isCorrect: false,
        },
        {
          id: "c4-tote",
          label: "Seat C4 Tote",
          detail: "Residence shuttle papers and study notes",
          isCorrect: false,
        },
        {
          id: "b2-duffel",
          label: "Seat B2 Duffel",
          detail: "Line 412 folder, booth token, and 11:40 departure stub",
          isCorrect: true,
        },
        {
          id: "booth-crate",
          label: "Booth Crate",
          detail: "Staff manuals, not passenger luggage",
          isCorrect: false,
        },
      ],
      question: "Which departure time should you record from the matching bag?",
      options: [
        { id: "1140", text: "11:40 PM", isCorrect: true, feedback: "Correct. The B2 duffel carries the 11:40 departure stub." },
        { id: "1025", text: "10:25 PM", isCorrect: false, feedback: "That is not the departure on the matching Line 412 bag." },
        { id: "930", text: "9:30 PM", isCorrect: false, feedback: "That belongs to an earlier route." },
        { id: "1210", text: "12:10 AM", isCorrect: false, feedback: "No current clue supports that time." },
      ],
    },
  },
  "floor-map": {
    id: "floor-map",
    title: "Gate Sign Array",
    subtitle: "Inspect the overhead signs and read the manual override note before using the keypad.",
    headline: "Manual gate reset requires one 7-digit entry",
    body: "The overhead sign cluster does not reveal a new number, but it does confirm the exact format required by the platform gate keypad.",
    lines: [
      "Manual gate reset accepts one 7-digit code",
      "Enter the line number before the departure time",
      "Do not add spaces, dashes, or route symbols",
      "Passengers missing tokens must report to the service booth",
    ],
    clue: TRAIN_SIGN_CLUE,
  },
};

export const trainDeskPuzzle: DeskPuzzle = {
  requiredItemId: SERVICE_TOKEN_ITEM.id,
  prompt: "The service booth drawer contains several transit cards. Choose the gate override card, not the delay memo or lost-property tags.",
  records: [
    {
      id: "delay-memo",
      tab: "Delay Memo",
      detail: "Storm routing shifts several daytime lines after 5:00 PM.",
      isCorrect: false,
    },
    {
      id: "gate-override",
      tab: "Gate Override",
      detail: "Platform gate procedure: enter the line number first, then wait for the platform announcement.",
      isCorrect: true,
    },
    {
      id: "lost-property",
      tab: "Lost Property",
      detail: "Log unclaimed bags with the service booth after the final boarding call.",
      isCorrect: false,
    },
    {
      id: "maintenance-slip",
      tab: "Maintenance",
      detail: "Escalator checks begin after the midnight platform sweep.",
      isCorrect: false,
    },
  ],
  question: "Which rule should go in your notebook before you use the station gate?",
  options: [
    {
      id: "line-first",
      text: "Use the line number first.",
      isCorrect: true,
      feedback: "Correct. The gate override card says the line number comes first.",
    },
    {
      id: "time-first",
      text: "Use the departure time first.",
      isCorrect: false,
      feedback: "That reverses the booth instruction. The line number must come first.",
    },
    {
      id: "token-first",
      text: "Use the service token first.",
      isCorrect: false,
      feedback: "The token opens the booth drawer, but it is not part of the code.",
    },
    {
      id: "seat-first",
      text: "Use the seat claim first.",
      isCorrect: false,
      feedback: "Seat B2 leads you to the bag, but it is not part of the final code.",
    },
  ],
};

export const trainSpeakerPuzzle: AudioPuzzle = {
  prompt: "Final platform notice. The last campus shuttle to Central Hub is preparing to depart. The final gate code uses the line number first, then the departure time.",
  instruction: "Listen carefully. The announcement confirms the second half of the code and tells riders where to go if their service token is missing.",
  src: "/quests/escape-room/audio/train-announcement.wav",
  transcript:
    "Final platform notice. The last campus shuttle to Central Hub is preparing to depart. The final gate code uses the line number first, then the departure time. If your service token is missing, report to the service booth before the gate seals.",
  clueValue: "TIME SECOND",
  steps: [
    {
      id: "announcement-order",
      question: "What does the platform announcement say to use second?",
      answerId: "departure-time",
      options: [
        { id: "line-number", text: "The line number", isCorrect: false, feedback: "The line number comes first, not second." },
        { id: "departure-time", text: "The departure time", isCorrect: true, feedback: "Correct. The departure time comes second." },
        { id: "seat-claim", text: "The seat claim", isCorrect: false, feedback: "Seat B2 is only a search lead." },
        { id: "service-token", text: "The service token", isCorrect: false, feedback: "The token unlocks the booth drawer, but it is not part of the code." },
      ],
    },
    {
      id: "sequence-check",
      question: "Which sequence matches the booth card and announcement together?",
      answerId: "line-then-time",
      options: [
        {
          id: "line-then-time",
          text: "Line number first, then departure time",
          isCorrect: true,
          feedback: "Correct. Use 412 first and 1140 second.",
        },
        {
          id: "time-then-line",
          text: "Departure time first, then line number",
          isCorrect: false,
          feedback: "That reverses the order confirmed by the booth card and announcement.",
        },
        {
          id: "seat-then-time",
          text: "Seat claim first, then departure time",
          isCorrect: false,
          feedback: "Seat B2 helps you find the bag, but it is not part of the code.",
        },
        {
          id: "token-then-line",
          text: "Service token first, then line number",
          isCorrect: false,
          feedback: "The token only opens the booth drawer.",
        },
      ],
    },
    {
      id: "help-point",
      question: "Where should riders go if their service token is missing?",
      answerId: "service-booth",
      options: [
        {
          id: "service-booth",
          text: "The service booth",
          isCorrect: true,
          feedback: "Correct. The announcement directs riders to the service booth.",
        },
        {
          id: "ticket-machine",
          text: "The ticket machine",
          isCorrect: false,
          feedback: "The kiosk prints slips, but the announcement sends riders elsewhere.",
        },
        {
          id: "platform-bench",
          text: "The platform bench",
          isCorrect: false,
          feedback: "That is where you found the bag, not where missing-token help is given.",
        },
        {
          id: "route-board",
          text: "The route board",
          isCorrect: false,
          feedback: "The board gives route information, not gate assistance.",
        },
      ],
    },
  ],
};
