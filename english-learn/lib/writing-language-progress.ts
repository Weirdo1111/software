import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import {
  getWritingLanguagePack,
  writingLanguageBank,
  type WritingDiscipline,
  type WritingSentenceItem,
  type WritingVocabularyItem,
} from "@/lib/writing-language-bank";
import type { CEFRLevel } from "@/types/learning";

const dataDirPath = join(process.cwd(), "data");
const allItemsDbPath = join(dataDirPath, "all-language-items.json");
const masteredItemsDbPath = join(dataDirPath, "mastered-language-items.json");

export type LanguageItemKind = "vocabulary" | "sentence";

export interface StoredLanguageItem {
  id: string;
  kind: LanguageItemKind;
  discipline: WritingDiscipline;
  level: CEFRLevel;
  title: string;
  content: string;
  detail: string;
}

interface AllLanguageItemsDatabase {
  items: StoredLanguageItem[];
}

interface MasteredEntry {
  userKey: string;
  itemId: string;
  masteredAt: string;
}

interface MasteredLanguageDatabase {
  mastered: MasteredEntry[];
}

function normalizeUserKey(userKey?: string) {
  const normalized = userKey?.trim();
  return normalized ? normalized : "guest";
}

function buildVocabularyItem(
  discipline: WritingDiscipline,
  level: CEFRLevel,
  title: string,
  item: WritingVocabularyItem,
) {
  return {
    id: randomUUID(),
    kind: "vocabulary" as const,
    discipline,
    level,
    title,
    content: item.term,
    detail: `${item.meaning} ${item.usage}`,
  };
}

function buildSentenceItem(
  discipline: WritingDiscipline,
  level: CEFRLevel,
  title: string,
  item: WritingSentenceItem,
) {
  return {
    id: randomUUID(),
    kind: "sentence" as const,
    discipline,
    level,
    title,
    content: item.text,
    detail: item.purpose,
  };
}

function buildAllItemsSeed(): AllLanguageItemsDatabase {
  const items: StoredLanguageItem[] = [];

  for (const pack of writingLanguageBank) {
    for (const vocabulary of pack.vocabulary) {
      items.push(buildVocabularyItem(pack.discipline, pack.level, pack.title, vocabulary));
    }

    for (const sentence of pack.sentences) {
      items.push(buildSentenceItem(pack.discipline, pack.level, pack.title, sentence));
    }
  }

  return { items };
}

async function ensureDatabaseFiles() {
  await fs.mkdir(dataDirPath, { recursive: true });

  try {
    await fs.access(allItemsDbPath);
  } catch {
    await fs.writeFile(allItemsDbPath, JSON.stringify(buildAllItemsSeed(), null, 2), "utf8");
  }

  try {
    await fs.access(masteredItemsDbPath);
  } catch {
    await fs.writeFile(masteredItemsDbPath, JSON.stringify({ mastered: [] }, null, 2), "utf8");
  }
}

async function readAllItemsDb(): Promise<AllLanguageItemsDatabase> {
  await ensureDatabaseFiles();
  const content = await fs.readFile(allItemsDbPath, "utf8");
  const parsed = JSON.parse(content) as Partial<AllLanguageItemsDatabase>;
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  if (items.length === 0) {
    const seed = buildAllItemsSeed();
    await fs.writeFile(allItemsDbPath, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }

  return {
    items,
  };
}

async function readMasteredDb(): Promise<MasteredLanguageDatabase> {
  await ensureDatabaseFiles();
  const content = await fs.readFile(masteredItemsDbPath, "utf8");
  const parsed = JSON.parse(content) as Partial<MasteredLanguageDatabase>;

  return {
    mastered: Array.isArray(parsed.mastered) ? parsed.mastered : [],
  };
}

async function writeMasteredDb(db: MasteredLanguageDatabase) {
  await fs.writeFile(masteredItemsDbPath, JSON.stringify(db, null, 2), "utf8");
}

function findFallbackItems(
  allItems: StoredLanguageItem[],
  masteredIds: Set<string>,
  kind: LanguageItemKind,
  limit: number,
) {
  return allItems.filter((item) => item.kind === kind && !masteredIds.has(item.id)).slice(0, limit);
}

export async function getWritingLanguageSnapshot(input: {
  userKey?: string;
  discipline: WritingDiscipline;
  level: CEFRLevel;
  vocabularyLimit?: number;
  sentenceLimit?: number;
}) {
  const userKey = normalizeUserKey(input.userKey);
  const vocabularyLimit = input.vocabularyLimit ?? 6;
  const sentenceLimit = input.sentenceLimit ?? 4;
  const [allItemsDb, masteredDb] = await Promise.all([readAllItemsDb(), readMasteredDb()]);
  const masteredIds = new Set(
    masteredDb.mastered.filter((entry) => entry.userKey === userKey).map((entry) => entry.itemId),
  );
  const selectedPack = getWritingLanguagePack(input.discipline, input.level);

  const vocabularyBase =
    allItemsDb.items.filter((item) => {
      return (
        item.kind === "vocabulary" &&
        item.discipline === input.discipline &&
        item.level === input.level &&
        !masteredIds.has(item.id)
      );
    }) ?? [];

  const sentenceBase =
    allItemsDb.items.filter((item) => {
      return (
        item.kind === "sentence" &&
        item.discipline === input.discipline &&
        item.level === input.level &&
        !masteredIds.has(item.id)
      );
    }) ?? [];

  const vocabulary =
    vocabularyBase.length >= vocabularyLimit
      ? vocabularyBase.slice(0, vocabularyLimit)
      : [
          ...vocabularyBase,
          ...findFallbackItems(
            allItemsDb.items,
            masteredIds,
            "vocabulary",
            Math.max(vocabularyLimit - vocabularyBase.length, 0),
          ),
        ];

  const sentences =
    sentenceBase.length >= sentenceLimit
      ? sentenceBase.slice(0, sentenceLimit)
      : [
          ...sentenceBase,
          ...findFallbackItems(
            allItemsDb.items,
            masteredIds,
            "sentence",
            Math.max(sentenceLimit - sentenceBase.length, 0),
          ),
        ];

  const masteredItems = allItemsDb.items.filter((item) => masteredIds.has(item.id));

  return {
    title: selectedPack?.title ?? `${input.discipline} ${input.level}`,
    vocabulary,
    sentences,
    masteredItems,
    totals: {
      all: allItemsDb.items.length,
      mastered: masteredItems.length,
      unmastered: allItemsDb.items.length - masteredItems.length,
    },
  };
}

export async function markWritingLanguageItemMastered(input: {
  userKey?: string;
  itemId: string;
}) {
  const userKey = normalizeUserKey(input.userKey);
  const [allItemsDb, masteredDb] = await Promise.all([readAllItemsDb(), readMasteredDb()]);
  const item = allItemsDb.items.find((entry) => entry.id === input.itemId);

  if (!item) {
    throw new Error("Language item not found");
  }

  const exists = masteredDb.mastered.some((entry) => entry.userKey === userKey && entry.itemId === input.itemId);

  if (!exists) {
    masteredDb.mastered.push({
      userKey,
      itemId: input.itemId,
      masteredAt: new Date().toISOString(),
    });
    await writeMasteredDb(masteredDb);
  }

  return item;
}

export async function getMasteredWritingLanguageItems(input: { userKey?: string }) {
  const userKey = normalizeUserKey(input.userKey);
  const [allItemsDb, masteredDb] = await Promise.all([readAllItemsDb(), readMasteredDb()]);
  const masteredEntries = masteredDb.mastered
    .filter((entry) => entry.userKey === userKey)
    .sort((a, b) => (a.masteredAt < b.masteredAt ? 1 : -1));

  return masteredEntries
    .map((entry) => {
      const item = allItemsDb.items.find((candidate) => candidate.id === entry.itemId);
      if (!item) return null;
      return {
        ...item,
        masteredAt: entry.masteredAt,
      };
    })
    .filter(Boolean);
}
