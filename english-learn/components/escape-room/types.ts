export type RoomObjectId =
  | "notice-board"
  | "return-cart"
  | "bookshelf"
  | "circulation-desk"
  | "speaker"
  | "floor-map"
  | "exit-door";

export type PuzzleId = Exclude<RoomObjectId, "exit-door">;

export type GamePhase = "intro" | "exploring" | "cart-found" | "shelf-found" | "desk-opened" | "audio-complete" | "ready-to-unlock" | "escaped";

export type ModalType = "clue" | "audio" | "desk" | "keypad" | "reward";

export type ClueKind = "code" | "intel";

export type SceneId = "briefing" | "library" | "exit";

export type LevelStatus = "live" | "locked";

export type RoomObjectState = "locked" | "available" | "cleared";

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
  modalType: Exclude<ModalType, "reward">;
  required: boolean;
  accent: string;
  iconKey?: string;
}

export interface ClueItem {
  id: string;
  label: string;
  value: string;
  kind: ClueKind;
  source: Exclude<RoomObjectId, "exit-door">;
  description: string;
}

export interface InventoryItem {
  id: string;
  label: string;
  value?: string;
  source: Exclude<RoomObjectId, "exit-door">;
  description: string;
  used: boolean;
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
  items: InventoryItem[];
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

export interface DeskRecord {
  id: string;
  tab: string;
  detail: string;
  isCorrect: boolean;
}

export interface DeskPuzzle {
  requiredItemId: string;
  prompt: string;
  records: DeskRecord[];
  question: string;
  options: QuizOption[];
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
