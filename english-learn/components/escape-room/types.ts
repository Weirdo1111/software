export type RoomObjectId =
  | "notice-board"
  | "bookshelf"
  | "floor-map"
  | "return-cart"
  | "speaker"
  | "librarian-desk-terminal"
  | "exit-door";

export type PuzzleId = "notice-board" | "bookshelf" | "speaker" | "librarian-desk-terminal" | "quiz";

export type GamePhase =
  | "intro"
  | "exploring"
  | "audio-complete"
  | "dialogue-complete"
  | "quiz-complete"
  | "ready-to-unlock"
  | "escaped";

export type ModalType = "clue" | "audio" | "dialogue" | "quiz" | "keypad" | "reward";

export type DialogueIntent = "ask_for_help" | "ask_for_hint" | "impolite_request" | "unrelated";

export type ClueKind = "code" | "intel";

export type SceneId = "briefing" | "library" | "exit";

export type LevelStatus = "live" | "locked";

export interface HotspotPosition {
  left: string;
  top: string;
}

export interface RoomObject {
  id: RoomObjectId;
  name: string;
  shortLabel: string;
  description: string;
  hotspot: HotspotPosition;
  modalType: Exclude<ModalType, "quiz" | "reward">;
  required: boolean;
  accent: string;
}

export interface ClueItem {
  id: string;
  label: string;
  value: string;
  kind: ClueKind;
  source: RoomObjectId;
  description: string;
}

export interface ClueModalContent {
  id: Extract<RoomObjectId, "notice-board" | "bookshelf" | "floor-map" | "return-cart">;
  title: string;
  subtitle: string;
  headline: string;
  body: string;
  lines: string[];
  clue: ClueItem;
  investigation?: InvestigationPuzzle;
}

export interface InventoryState {
  clues: ClueItem[];
  notes: string[];
}

export interface RewardState {
  xpEarned: number;
  badgeUnlocked: string | null;
  escaped: boolean;
}

export interface GameProgress {
  started: boolean;
  phase: GamePhase;
  currentObjective: string;
  completedPuzzles: Record<PuzzleId, boolean>;
  inventory: InventoryState;
  reward: RewardState;
  keypadAttempts: number;
}

export interface InvestigationTarget {
  id: string;
  label: string;
  detail: string;
  isCorrect: boolean;
}

export interface InvestigationPuzzle {
  visualStyle: "board" | "shelf";
  prompt: string;
  targets: InvestigationTarget[];
  question: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface AudioPuzzleStep {
  id: string;
  question: string;
  answerId: string;
  options: QuizOption[];
}

export interface AudioPuzzle {
  prompt: string;
  instruction: string;
  src: string;
  transcript: string;
  steps: AudioPuzzleStep[];
  clueValue: string;
}

export interface ChoiceQuiz {
  question: string;
  options: QuizOption[];
}

export interface DialogueTurn {
  id: string;
  role: "player" | "librarian";
  content: string;
  intent?: DialogueIntent;
}

export interface ProgressTask {
  id: PuzzleId;
  label: string;
  supportText: string;
}

export interface GameLevel {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  difficulty: string;
  duration: string;
  status: LevelStatus;
  mission: string;
  reward: string;
  href?: string;
  accent: string;
  cover: string;
}
