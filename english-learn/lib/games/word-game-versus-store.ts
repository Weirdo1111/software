import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";

import { getWordGamePool } from "@/lib/games/word-game-lexicon";
import type { RecoveryWord } from "@/lib/games/word-game-recovery";
import {
  WORD_GAME_VERSUS_MATCH_DURATION_SECONDS,
  WORD_GAME_VERSUS_MAX_HP,
  WORD_GAME_VERSUS_TOTAL_WAVES,
  type VersusEnemyType,
  type VersusResultReason,
  type VersusRoomState,
  type VersusRoomStatus,
} from "@/lib/games/word-game-versus-types";

const ROOM_DB_PATH = join(process.cwd(), "data", "word-game-versus-rooms.json");
const QUESTION_DURATION_SECONDS = 16;
const ROOM_FINISHED_RETENTION_MS = 2 * 60 * 60 * 1000;
const ROOM_LOBBY_RETENTION_MS = 12 * 60 * 60 * 1000;
const ROOM_ACTIVE_RETENTION_MS = 6 * 60 * 60 * 1000;
const MIN_SUBMIT_INTERVAL_MS = 250;

let roomDbOperation = Promise.resolve<void>(undefined);

type InternalPlayer = {
  id: string;
  name: string;
  ready: boolean;
  hp: number;
  score: number;
  isHost: boolean;
  joinedAt: number;
  lastSeenAt: number;
  lastSubmitAt: number;
};

type InternalQuestionOption = {
  word: string;
  meaningEn: string;
  meaningZh: string;
};

type InternalQuestion = {
  type: VersusEnemyType;
  word: string;
  maskedWord: string;
  options: InternalQuestionOption[];
  correctOptionIndex: number;
  openedAt: number;
  deadlineAt: number;
};

type InternalRoom = {
  roomCode: string;
  bank: string;
  status: VersusRoomStatus;
  totalWaves: number;
  waveNumber: number;
  createdAt: number;
  updatedAt: number;
  startedAt: number | null;
  lastEvent: string;
  winnerId: string | null;
  winnerLabel: string | null;
  resultReason: VersusResultReason;
  players: InternalPlayer[];
  question: InternalQuestion | null;
  usedWords: string[];
};

type WordGameVersusDb = {
  rooms: InternalRoom[];
};

type CreateRoomInput = {
  playerId: string;
  playerName?: string;
  bank: string;
  preferredRoomCode?: string;
};

type JoinRoomInput = {
  roomCode: string;
  playerId: string;
  playerName?: string;
};

type SetReadyInput = {
  roomCode: string;
  playerId: string;
  ready: boolean;
};

type StartMatchInput = {
  roomCode: string;
  playerId: string;
};

type SubmitAnswerInput = {
  roomCode: string;
  playerId: string;
  answer: string;
};

export class WordGameVersusStoreError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const shuffle = <T,>(list: T[]) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const toReadableWord = (word: string) => (word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : word);

const maskWord = (word: string) => {
  const readable = toReadableWord(word);
  const idx = Math.min(2, Math.max(1, word.length - 2));
  return readable
    .split("")
    .map((ch, i) => (i === idx ? "_" : ch))
    .join("");
};

const normalizeRoomCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
const normalizePlayerId = (value: string) => value.trim();
const normalizeAnswer = (value: string) => value.trim().toLowerCase();

const sanitizePlayerName = (value?: string) => {
  const fallback = "Player";
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return fallback;
  return normalized.slice(0, 20);
};

const createRoomCode = (existingCodes: Set<string>) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let nextCode = "";
  for (let attempt = 0; attempt < 80; attempt += 1) {
    nextCode = "";
    for (let i = 0; i < 6; i += 1) {
      nextCode += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!existingCodes.has(nextCode)) {
      return nextCode;
    }
  }

  return `${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 99).toString().padStart(2, "0")}`.slice(0, 6);
};

const withRoomDbLock = <T,>(task: () => Promise<T>) => {
  const next = roomDbOperation.catch(() => undefined).then(task);
  roomDbOperation = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
};

const createEmptyDb = (): WordGameVersusDb => ({
  rooms: [],
});

const ensureRoomDb = async () => {
  try {
    await fs.access(ROOM_DB_PATH);
  } catch {
    await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
    await fs.writeFile(ROOM_DB_PATH, JSON.stringify(createEmptyDb(), null, 2), "utf8");
  }
};

const readRoomDb = async (): Promise<WordGameVersusDb> => {
  await ensureRoomDb();
  const raw = await fs.readFile(ROOM_DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as Partial<WordGameVersusDb>;
    return {
      rooms: Array.isArray(parsed.rooms) ? (parsed.rooms as InternalRoom[]) : [],
    };
  } catch {
    return createEmptyDb();
  }
};

const writeRoomDb = async (db: WordGameVersusDb) => {
  const tempPath = `${ROOM_DB_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tempPath, ROOM_DB_PATH);
};

const getPoolForRoom = (bank: string) => {
  const selected = getWordGamePool(bank);
  if (selected.length >= 3) return selected;
  return getWordGamePool("general");
};

const buildOptionSet = (entry: RecoveryWord, pool: RecoveryWord[]) => {
  const distractors = shuffle(pool.filter((word) => word.word !== entry.word)).slice(0, 2);
  const options = shuffle([entry, ...distractors]);
  return options.length >= 3 ? options : [entry, ...shuffle(pool).slice(0, 2)];
};

const buildQuestionForWave = (pool: RecoveryWord[], waveIndex: number, usedWords: string[], now: number): InternalQuestion => {
  const usedSet = new Set(usedWords.map((word) => word.toLowerCase()));
  const candidates = pool.filter((entry) => !usedSet.has(entry.word.toLowerCase()));
  const selectedPool = candidates.length > 0 ? candidates : pool;
  const entry = shuffle(selectedPool)[0] ?? pool[0];
  const options = buildOptionSet(entry, pool);

  const correctOptionIndex = options.findIndex((option) => option.word === entry.word);
  return {
    type: waveIndex % 2 === 0 ? "spell" : "meaning",
    word: entry.word,
    maskedWord: maskWord(entry.word),
    options: options.map((option) => ({
      word: option.word,
      meaningEn: option.meaningEn,
      meaningZh: option.meaningZh,
    })),
    correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : 0,
    openedAt: now,
    deadlineAt: now + QUESTION_DURATION_SECONDS * 1000,
  };
};

const resolveWinnerByStanding = (room: InternalRoom) => {
  const sorted = [...room.players].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (right.hp !== left.hp) return right.hp - left.hp;
    return left.joinedAt - right.joinedAt;
  });

  if (sorted.length < 2) {
    return {
      winnerId: sorted[0]?.id ?? null,
      winnerLabel: sorted[0]?.name ?? null,
      draw: false,
    };
  }

  const [first, second] = sorted;
  if (first.score === second.score && first.hp === second.hp) {
    return {
      winnerId: null,
      winnerLabel: "Draw",
      draw: true,
    };
  }

  return {
    winnerId: first.id,
    winnerLabel: first.name,
    draw: false,
  };
};

const finishRoom = (room: InternalRoom, reason: VersusResultReason, eventMessage: string, winnerId?: string | null) => {
  room.status = "finished";
  room.resultReason = reason;
  room.question = null;

  if (winnerId) {
    const winner = room.players.find((player) => player.id === winnerId) ?? null;
    room.winnerId = winner?.id ?? null;
    room.winnerLabel = winner?.name ?? null;
  } else {
    const result = resolveWinnerByStanding(room);
    room.winnerId = result.winnerId;
    room.winnerLabel = result.winnerLabel;
  }

  room.lastEvent = eventMessage;
};

const tryResolveKnockout = (room: InternalRoom, reason: VersusResultReason, now: number) => {
  const alivePlayers = room.players.filter((player) => player.hp > 0);
  if (alivePlayers.length > 1) {
    return false;
  }

  if (alivePlayers.length === 1) {
    finishRoom(
      room,
      reason,
      `${alivePlayers[0].name} wins by knockout.`,
      alivePlayers[0].id,
    );
    room.updatedAt = now;
    return true;
  }

  finishRoom(room, reason, "Both cores collapsed. Winner decided by score.");
  room.updatedAt = now;
  return true;
};

const openNextWave = (room: InternalRoom, pool: RecoveryWord[], now: number) => {
  if (room.waveNumber > room.totalWaves) {
    finishRoom(room, "waves", "All waves cleared. Winner decided by score.");
    room.updatedAt = now;
    return;
  }

  const question = buildQuestionForWave(pool, room.waveNumber - 1, room.usedWords, now);
  room.question = question;
  room.usedWords.push(question.word);
  room.lastEvent = `Wave ${room.waveNumber} started.`;
  room.updatedAt = now;
};

const runRoomClock = (room: InternalRoom, now: number) => {
  if (room.status !== "active" || !room.startedAt) return;

  const pool = getPoolForRoom(room.bank);
  const matchDeadline = room.startedAt + WORD_GAME_VERSUS_MATCH_DURATION_SECONDS * 1000;
  if (now >= matchDeadline) {
    finishRoom(room, "timeout", "Match time is over. Winner decided by score.");
    room.updatedAt = now;
    return;
  }

  while (room.status === "active" && room.question && now >= room.question.deadlineAt) {
    for (const player of room.players) {
      player.hp = Math.max(0, player.hp - 1);
    }

    room.lastEvent = `Wave ${room.waveNumber} timed out. Both players lost 1 HP.`;
    if (tryResolveKnockout(room, "timeout", now)) {
      return;
    }

    room.waveNumber += 1;
    if (room.waveNumber > room.totalWaves) {
      finishRoom(room, "waves", "All waves cleared. Winner decided by score.");
      room.updatedAt = now;
      return;
    }

    openNextWave(room, pool, now);
  }
};

const updateRoomActivity = (room: InternalRoom, playerId?: string) => {
  const now = Date.now();
  room.updatedAt = now;
  if (!playerId) return;
  const target = room.players.find((player) => player.id === playerId);
  if (target) {
    target.lastSeenAt = now;
  }
};

const getRequiredRoom = (db: WordGameVersusDb, rawRoomCode: string) => {
  const roomCode = normalizeRoomCode(rawRoomCode);
  if (roomCode.length !== 6) {
    throw new WordGameVersusStoreError("Invalid room code.", 422);
  }

  const room = db.rooms.find((item) => item.roomCode === roomCode);
  if (!room) {
    throw new WordGameVersusStoreError("Room not found.", 404);
  }

  return room;
};

const getRequiredPlayer = (room: InternalRoom, rawPlayerId: string) => {
  const playerId = normalizePlayerId(rawPlayerId);
  if (!playerId) {
    throw new WordGameVersusStoreError("Missing player id.", 422);
  }

  const player = room.players.find((item) => item.id === playerId);
  if (!player) {
    throw new WordGameVersusStoreError("You are not in this room.", 403);
  }
  return player;
};

const cleanupRooms = (db: WordGameVersusDb, now: number) => {
  db.rooms = db.rooms.filter((room) => {
    const age = now - room.updatedAt;
    if (room.status === "finished") {
      return age <= ROOM_FINISHED_RETENTION_MS;
    }
    if (room.status === "active") {
      return age <= ROOM_ACTIVE_RETENTION_MS;
    }
    return age <= ROOM_LOBBY_RETENTION_MS;
  });
};

const mapRoomState = (room: InternalRoom, playerId?: string): VersusRoomState => {
  const now = Date.now();
  runRoomClock(room, now);

  const elapsed = room.startedAt ? Math.floor((now - room.startedAt) / 1000) : 0;
  const secondsLeft =
    room.status === "active"
      ? Math.max(0, WORD_GAME_VERSUS_MATCH_DURATION_SECONDS - elapsed)
      : room.status === "finished"
        ? 0
        : WORD_GAME_VERSUS_MATCH_DURATION_SECONDS;

  const players = room.players.map((player) => ({
    id: player.id,
    name: player.name,
    ready: player.ready,
    hp: player.hp,
    score: player.score,
    isSelf: playerId ? player.id === playerId : false,
    isHost: player.isHost,
    isBot: false,
  }));

  const question =
    room.status === "active" && room.question
      ? {
          type: room.question.type,
          wordDisplay: room.question.type === "spell" ? room.question.maskedWord : toReadableWord(room.question.word),
          hint:
            room.question.type === "spell"
              ? "Type the full word to strike your opponent core."
              : "Type the correct option number (1-3).",
          options: room.question.type === "meaning" ? room.question.options.map((option) => option.meaningZh) : [],
        }
      : null;

  const canStart = room.status === "lobby" && room.players.length === 2 && room.players.every((player) => player.ready);
  const orderedPlayers = playerId
    ? players.sort((left, right) => Number(right.isSelf) - Number(left.isSelf))
    : players;

  return {
    roomCode: room.roomCode,
    bank: room.bank,
    status: room.status,
    totalWaves: room.totalWaves,
    waveNumber: room.waveNumber,
    secondsLeft,
    lastEvent: room.lastEvent,
    winnerLabel: room.winnerLabel,
    resultReason: room.resultReason,
    players: orderedPlayers,
    question,
    canStart,
  };
};

const parseCorrect = (room: InternalRoom, answer: string) => {
  if (!room.question) {
    return false;
  }

  const normalized = normalizeAnswer(answer);
  if (!normalized) return false;

  if (room.question.type === "spell") {
    return normalized === room.question.word.toLowerCase();
  }

  const index = room.question.correctOptionIndex + 1;
  const option = room.question.options[room.question.correctOptionIndex];
  const optionZh = option?.meaningZh?.toLowerCase().trim() ?? "";
  const optionEn = option?.meaningEn?.toLowerCase().trim() ?? "";

  return normalized === String(index) || normalized === optionZh || normalized === optionEn;
};

const calculateScoreGain = (room: InternalRoom, now: number) => {
  if (!room.question) return 100;
  const elapsed = Math.max(0, Math.floor((now - room.question.openedAt) / 1000));
  const speedBonus = Math.max(0, 80 - elapsed * 6);
  return 100 + speedBonus;
};

export async function createVersusRoom(input: CreateRoomInput) {
  return withRoomDbLock(async () => {
    const now = Date.now();
    const db = await readRoomDb();
    cleanupRooms(db, now);

    const playerId = normalizePlayerId(input.playerId);
    if (!playerId) {
      throw new WordGameVersusStoreError("Missing player id.", 422);
    }

    const existingCodes = new Set(db.rooms.map((room) => room.roomCode));
    const preferredRoomCode = input.preferredRoomCode ? normalizeRoomCode(input.preferredRoomCode) : "";

    if (preferredRoomCode && preferredRoomCode.length !== 6) {
      throw new WordGameVersusStoreError("Room code must be 6 characters.", 422);
    }

    if (preferredRoomCode && existingCodes.has(preferredRoomCode)) {
      throw new WordGameVersusStoreError("Room code already exists. Please regenerate.", 409);
    }

    const roomCode = preferredRoomCode || createRoomCode(existingCodes);
    const room: InternalRoom = {
      roomCode,
      bank: input.bank || "general",
      status: "lobby",
      totalWaves: WORD_GAME_VERSUS_TOTAL_WAVES,
      waveNumber: 1,
      createdAt: now,
      updatedAt: now,
      startedAt: null,
      lastEvent: "Room created. Waiting for opponent.",
      winnerId: null,
      winnerLabel: null,
      resultReason: null,
      players: [
        {
          id: playerId,
          name: sanitizePlayerName(input.playerName),
          ready: false,
          hp: WORD_GAME_VERSUS_MAX_HP,
          score: 0,
          isHost: true,
          joinedAt: now,
          lastSeenAt: now,
          lastSubmitAt: 0,
        },
      ],
      question: null,
      usedWords: [],
    };

    db.rooms.push(room);
    await writeRoomDb(db);
    return mapRoomState(room, playerId);
  });
}

export async function joinVersusRoom(input: JoinRoomInput) {
  return withRoomDbLock(async () => {
    const now = Date.now();
    const db = await readRoomDb();
    cleanupRooms(db, now);

    const room = getRequiredRoom(db, input.roomCode);
    const playerId = normalizePlayerId(input.playerId);
    if (!playerId) {
      throw new WordGameVersusStoreError("Missing player id.", 422);
    }

    const existingPlayer = room.players.find((player) => player.id === playerId);
    if (existingPlayer) {
      existingPlayer.name = sanitizePlayerName(input.playerName || existingPlayer.name);
      existingPlayer.lastSeenAt = now;
      room.lastEvent = `${existingPlayer.name} rejoined the room.`;
      room.updatedAt = now;
      await writeRoomDb(db);
      return mapRoomState(room, playerId);
    }

    if (room.status !== "lobby") {
      throw new WordGameVersusStoreError("Match already started. Cannot join now.", 409);
    }

    if (room.players.length >= 2) {
      throw new WordGameVersusStoreError("Room is full.", 409);
    }

    const joined: InternalPlayer = {
      id: playerId,
      name: sanitizePlayerName(input.playerName),
      ready: false,
      hp: WORD_GAME_VERSUS_MAX_HP,
      score: 0,
      isHost: false,
      joinedAt: now,
      lastSeenAt: now,
      lastSubmitAt: 0,
    };
    room.players.push(joined);
    room.lastEvent = `${joined.name} joined the room.`;
    room.updatedAt = now;

    await writeRoomDb(db);
    return mapRoomState(room, playerId);
  });
}

export async function getVersusRoomState(roomCode: string, playerId?: string) {
  return withRoomDbLock(async () => {
    const now = Date.now();
    const db = await readRoomDb();
    cleanupRooms(db, now);

    const room = getRequiredRoom(db, roomCode);
    runRoomClock(room, now);
    updateRoomActivity(room, playerId);

    await writeRoomDb(db);
    return mapRoomState(room, playerId);
  });
}

export async function setVersusPlayerReady(input: SetReadyInput) {
  return withRoomDbLock(async () => {
    const now = Date.now();
    const db = await readRoomDb();
    cleanupRooms(db, now);

    const room = getRequiredRoom(db, input.roomCode);
    if (room.status !== "lobby") {
      throw new WordGameVersusStoreError("Match already started.", 409);
    }

    const player = getRequiredPlayer(room, input.playerId);
    player.ready = Boolean(input.ready);
    player.lastSeenAt = now;
    room.lastEvent = `${player.name} is ${player.ready ? "ready" : "not ready"}.`;
    room.updatedAt = now;

    await writeRoomDb(db);
    return mapRoomState(room, player.id);
  });
}

export async function startVersusMatch(input: StartMatchInput) {
  return withRoomDbLock(async () => {
    const now = Date.now();
    const db = await readRoomDb();
    cleanupRooms(db, now);

    const room = getRequiredRoom(db, input.roomCode);
    if (room.status !== "lobby") {
      throw new WordGameVersusStoreError("Match already started.", 409);
    }

    const host = getRequiredPlayer(room, input.playerId);
    if (!host.isHost) {
      throw new WordGameVersusStoreError("Only host can start the match.", 403);
    }

    if (room.players.length !== 2) {
      throw new WordGameVersusStoreError("Need two players to start.", 409);
    }

    if (!room.players.every((player) => player.ready)) {
      throw new WordGameVersusStoreError("Both players must be ready.", 409);
    }

    room.status = "active";
    room.startedAt = now;
    room.waveNumber = 1;
    room.resultReason = null;
    room.winnerId = null;
    room.winnerLabel = null;
    room.lastEvent = "Match started.";
    room.usedWords = [];

    for (const player of room.players) {
      player.hp = WORD_GAME_VERSUS_MAX_HP;
      player.score = 0;
      player.lastSeenAt = now;
      player.lastSubmitAt = 0;
    }

    const pool = getPoolForRoom(room.bank);
    openNextWave(room, pool, now);

    await writeRoomDb(db);
    return mapRoomState(room, input.playerId);
  });
}

export async function submitVersusAnswer(input: SubmitAnswerInput) {
  return withRoomDbLock(async () => {
    const now = Date.now();
    const db = await readRoomDb();
    cleanupRooms(db, now);

    const room = getRequiredRoom(db, input.roomCode);
    runRoomClock(room, now);
    if (room.status !== "active") {
      throw new WordGameVersusStoreError("Match is not active.", 409);
    }

    const player = getRequiredPlayer(room, input.playerId);
    if (player.hp <= 0) {
      throw new WordGameVersusStoreError("Your core has collapsed.", 409);
    }

    if (now - player.lastSubmitAt < MIN_SUBMIT_INTERVAL_MS) {
      throw new WordGameVersusStoreError("Too many submissions. Slow down.", 429);
    }

    if (!room.question) {
      throw new WordGameVersusStoreError("Question not ready.", 409);
    }

    player.lastSubmitAt = now;
    player.lastSeenAt = now;

    const correct = parseCorrect(room, input.answer);
    if (correct) {
      const scoreGain = calculateScoreGain(room, now);
      const opponent = room.players.find((item) => item.id !== player.id) ?? null;

      player.score += scoreGain;
      if (opponent) {
        opponent.hp = Math.max(0, opponent.hp - 1);
      }

      room.lastEvent = opponent
        ? `${player.name} answered correctly (+${scoreGain}) and hit ${opponent.name}.`
        : `${player.name} answered correctly (+${scoreGain}).`;

      if (opponent && opponent.hp <= 0) {
        finishRoom(room, "knockout", `${player.name} wins by knockout.`, player.id);
      } else {
        room.waveNumber += 1;
        if (room.waveNumber > room.totalWaves) {
          finishRoom(room, "waves", "All waves cleared. Winner decided by score.");
        } else {
          const pool = getPoolForRoom(room.bank);
          openNextWave(room, pool, now);
        }
      }
    } else {
      player.hp = Math.max(0, player.hp - 1);
      room.lastEvent = `${player.name} answered incorrectly and lost 1 HP.`;
      if (player.hp <= 0) {
        const opponent = room.players.find((item) => item.id !== player.id && item.hp > 0) ?? null;
        if (opponent) {
          finishRoom(room, "knockout", `${opponent.name} wins by knockout.`, opponent.id);
        } else {
          finishRoom(room, "knockout", "Both cores collapsed. Winner decided by score.");
        }
      }
    }

    room.updatedAt = now;
    await writeRoomDb(db);
    return mapRoomState(room, player.id);
  });
}

export async function leaveVersusRoom(roomCode: string, playerId: string) {
  return withRoomDbLock(async () => {
    const now = Date.now();
    const db = await readRoomDb();
    cleanupRooms(db, now);

    const room = getRequiredRoom(db, roomCode);
    const normalizedId = normalizePlayerId(playerId);
    if (!normalizedId) {
      throw new WordGameVersusStoreError("Missing player id.", 422);
    }

    room.players = room.players.filter((player) => player.id !== normalizedId);

    if (room.players.length === 0) {
      db.rooms = db.rooms.filter((item) => item.roomCode !== room.roomCode);
    } else {
      if (!room.players.some((player) => player.isHost)) {
        room.players[0].isHost = true;
      }
      room.lastEvent = "A player left the room.";
      room.updatedAt = now;
    }

    await writeRoomDb(db);
    return { ok: true };
  });
}

export function createLocalVersusPlayer() {
  return {
    id: randomUUID(),
    name: `Player-${Math.floor(Math.random() * 900 + 100)}`,
  };
}
