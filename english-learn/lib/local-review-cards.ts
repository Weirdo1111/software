import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const reviewDbPath = join(process.cwd(), "data", "local-review-cards.json");

export interface LocalReviewCard {
  id: string;
  user_id: string;
  front: string;
  back: string;
  tag: string;
  stability: number;
  difficulty: number;
  due_at: string;
  last_reviewed_at: string | null;
  lapses: number;
  created_at: string;
}

interface LocalReviewLog {
  id: string;
  card_id: string;
  user_id: string;
  rating: number;
  next_due_at: string;
  created_at: string;
}

interface LocalReviewDatabase {
  cards: LocalReviewCard[];
  logs: LocalReviewLog[];
}

async function ensureLocalReviewDb() {
  try {
    await fs.access(reviewDbPath);
  } catch {
    await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
    await fs.writeFile(reviewDbPath, JSON.stringify({ cards: [], logs: [] }, null, 2), "utf8");
  }
}

async function readLocalReviewDb(): Promise<LocalReviewDatabase> {
  await ensureLocalReviewDb();
  const content = await fs.readFile(reviewDbPath, "utf8");
  const parsed = JSON.parse(content) as Partial<LocalReviewDatabase>;

  return {
    cards: Array.isArray(parsed.cards) ? parsed.cards : [],
    logs: Array.isArray(parsed.logs) ? parsed.logs : [],
  };
}

async function writeLocalReviewDb(db: LocalReviewDatabase) {
  await fs.writeFile(reviewDbPath, JSON.stringify(db, null, 2), "utf8");
}

export async function listLocalReviewCards(userId: string, options?: { dueOnly?: boolean; tag?: string | null }) {
  const db = await readLocalReviewDb();
  const now = new Date();

  return db.cards
    .filter((card) => card.user_id === userId)
    .filter((card) => (options?.tag ? card.tag === options.tag : true))
    .filter((card) => (options?.dueOnly ? new Date(card.due_at) <= now : true))
    .sort((a, b) => a.due_at.localeCompare(b.due_at));
}

export async function listLocalReviewHistory(userId: string) {
  const db = await readLocalReviewDb();
  const cardsById = new Map(db.cards.map((card) => [card.id, card]));

  return db.logs
    .filter((log) => log.user_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 10)
    .map((log) => ({
      id: log.id,
      card_front: cardsById.get(log.card_id)?.front ?? "Unknown",
      rating: log.rating,
      reviewed_at: log.created_at,
    }));
}

export async function createLocalReviewCards(
  userId: string,
  words: Array<{ front: string; back: string; tag?: string }>,
) {
  const db = await readLocalReviewDb();
  const existingSet = new Set(
    db.cards
      .filter((card) => card.user_id === userId)
      .map((card) => `${card.front.toLowerCase()}::${card.back.toLowerCase()}`),
  );
  const newWords = words.filter((word) => !existingSet.has(`${word.front.toLowerCase()}::${word.back.toLowerCase()}`));
  const now = new Date().toISOString();

  const rows: LocalReviewCard[] = newWords.map((word) => ({
    id: randomUUID(),
    user_id: userId,
    front: word.front,
    back: word.back,
    tag: word.tag ?? "general",
    stability: 2,
    difficulty: 5,
    due_at: now,
    last_reviewed_at: null,
    lapses: 0,
    created_at: now,
  }));

  db.cards.push(...rows);
  await writeLocalReviewDb(db);

  return {
    saved: rows.length,
    skipped: words.length - rows.length,
  };
}

export async function updateLocalReviewCard(
  userId: string,
  cardId: string,
  update: Pick<LocalReviewCard, "stability" | "difficulty" | "due_at" | "last_reviewed_at" | "lapses">,
  reviewLog: { rating: number; next_due_at: string },
) {
  const db = await readLocalReviewDb();
  const card = db.cards.find((entry) => entry.id === cardId && entry.user_id === userId);

  if (!card) {
    return null;
  }

  card.stability = update.stability;
  card.difficulty = update.difficulty;
  card.due_at = update.due_at;
  card.last_reviewed_at = update.last_reviewed_at;
  card.lapses = update.lapses;

  db.logs.push({
    id: randomUUID(),
    card_id: cardId,
    user_id: userId,
    rating: reviewLog.rating,
    next_due_at: reviewLog.next_due_at,
    created_at: new Date().toISOString(),
  });

  await writeLocalReviewDb(db);
  return card;
}

export async function deleteLocalReviewCard(userId: string, cardId: string) {
  const db = await readLocalReviewDb();
  const before = db.cards.length;
  db.cards = db.cards.filter((card) => !(card.id === cardId && card.user_id === userId));
  db.logs = db.logs.filter((log) => log.card_id !== cardId || log.user_id !== userId);

  if (db.cards.length === before) {
    return false;
  }

  await writeLocalReviewDb(db);
  return true;
}
