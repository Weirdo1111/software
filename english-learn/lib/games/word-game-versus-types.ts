export type VersusEnemyType = "spell" | "meaning";

export type VersusRoomStatus = "lobby" | "active" | "finished";

export type VersusResultReason = "waves" | "knockout" | "timeout" | null;

export type VersusPlayerView = {
  id: string;
  name: string;
  ready: boolean;
  hp: number;
  score: number;
  isSelf: boolean;
  isHost: boolean;
  isBot: boolean;
};

export type VersusQuestionView = {
  type: VersusEnemyType;
  wordDisplay: string;
  hint: string;
  options: string[];
};

export type VersusRoomState = {
  roomCode: string;
  bank: string;
  status: VersusRoomStatus;
  totalWaves: number;
  waveNumber: number;
  secondsLeft: number;
  lastEvent: string;
  winnerLabel: string | null;
  resultReason: VersusResultReason;
  players: VersusPlayerView[];
  question: VersusQuestionView | null;
  canStart: boolean;
};

export const WORD_GAME_VERSUS_MAX_HP = 5;
export const WORD_GAME_VERSUS_TOTAL_WAVES = 8;
export const WORD_GAME_VERSUS_MATCH_DURATION_SECONDS = 180;
