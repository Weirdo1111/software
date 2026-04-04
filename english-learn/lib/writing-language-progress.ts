import { promises as fs } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";

import {
  getWritingLanguagePack,
  writingLanguageBank,
  type WritingDiscipline,
  type WritingSentenceItem,
  type WritingVocabularyItem,
} from "@/lib/writing-language-bank";
import { isDatabaseAuthConfigured } from "@/lib/local-auth";
import { prisma } from "@/lib/prisma";
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

function normalizeUserId(userId?: string | bigint) {
  if (typeof userId === "bigint") {
    return userId;
  }

  const raw = userId?.trim();
  if (!raw) {
    return null;
  }

  if (!/^\d+$/.test(raw)) {
    return null;
  }

  return BigInt(raw);
}

function buildWritingLanguageItemKey(input: {
  kind: LanguageItemKind;
  discipline: WritingDiscipline;
  level: CEFRLevel;
  title: string;
  content: string;
  detail: string;
}) {
  const digest = createHash("sha1")
    .update(
      [
        input.kind,
        input.discipline,
        input.level,
        input.title.trim().toLowerCase(),
        input.content.trim().toLowerCase(),
        input.detail.trim().toLowerCase(),
      ].join("::"),
    )
    .digest("hex");

  return `${input.kind}-${digest}`;
}

function mapDatabaseItemToStoredItem(item: {
  id: string;
  kind: string;
  discipline: string;
  level: string;
  title: string;
  content: string;
  detail: string;
}): StoredLanguageItem {
  return {
    id: item.id,
    kind: item.kind === "sentence" ? "sentence" : "vocabulary",
    discipline: item.discipline as WritingDiscipline,
    level: item.level as CEFRLevel,
    title: item.title,
    content: item.content,
    detail: item.detail,
  };
}

function buildDatabaseSeedRows() {
  const rows: Array<{
    itemKey: string;
    kind: LanguageItemKind;
    discipline: WritingDiscipline;
    level: CEFRLevel;
    title: string;
    content: string;
    detail: string;
  }> = [];

  for (const pack of writingLanguageBank) {
    for (const vocabulary of pack.vocabulary) {
      const row = {
        kind: "vocabulary" as const,
        discipline: pack.discipline,
        level: pack.level,
        title: pack.title,
        content: vocabulary.term,
        detail: `${vocabulary.meaning} ${vocabulary.usage}`,
      };
      rows.push({
        ...row,
        itemKey: buildWritingLanguageItemKey(row),
      });
    }

    for (const sentence of pack.sentences) {
      const row = {
        kind: "sentence" as const,
        discipline: pack.discipline,
        level: pack.level,
        title: pack.title,
        content: sentence.text,
        detail: sentence.purpose,
      };
      rows.push({
        ...row,
        itemKey: buildWritingLanguageItemKey(row),
      });
    }
  }

  return rows;
}

async function ensureDatabaseWritingLanguageSeeded() {
  if (!isDatabaseAuthConfigured()) {
    return false;
  }

  try {
    const existingCount = await prisma.writingLanguageItem.count();
    if (existingCount > 0) {
      return true;
    }

    const seedRows = buildDatabaseSeedRows();
    if (seedRows.length === 0) {
      return true;
    }

    await prisma.writingLanguageItem.createMany({
      data: seedRows,
      skipDuplicates: true,
    });
    return true;
  } catch {
    return false;
  }
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

async function getWritingLanguageSnapshotFromDatabase(input: {
  userId: string | bigint;
  discipline: WritingDiscipline;
  level: CEFRLevel;
  vocabularyLimit: number;
  sentenceLimit: number;
}) {
  const userId = normalizeUserId(input.userId);

  if (!userId) {
    return null;
  }

  const seeded = await ensureDatabaseWritingLanguageSeeded();
  if (!seeded) {
    return null;
  }

  const [allCount, masteryRows] = await Promise.all([
    prisma.writingLanguageItem.count(),
    prisma.writingLanguageMastery.findMany({
      where: { userId },
      orderBy: [{ masteredAt: "desc" }, { id: "desc" }],
      include: {
        item: true,
      },
    }),
  ]);

  const masteredIds = masteryRows.map((entry) => entry.itemId);
  const masteredIdSet = new Set(masteredIds);
  const masteredItems = masteryRows.map((entry) => ({
    ...mapDatabaseItemToStoredItem(entry.item),
    masteredAt: entry.masteredAt.toISOString(),
  }));

  const vocabularyBase = await prisma.writingLanguageItem.findMany({
    where: {
      kind: "vocabulary",
      discipline: input.discipline,
      level: input.level,
      ...(masteredIds.length > 0 ? { id: { notIn: masteredIds } } : {}),
    },
    orderBy: [{ itemKey: "asc" }],
    take: input.vocabularyLimit,
  });

  const vocabularyFallback =
    vocabularyBase.length >= input.vocabularyLimit
      ? []
      : await prisma.writingLanguageItem.findMany({
          where: {
            kind: "vocabulary",
            id: {
              notIn: [...masteredIds, ...vocabularyBase.map((item) => item.id)],
            },
          },
          orderBy: [{ itemKey: "asc" }],
          take: Math.max(input.vocabularyLimit - vocabularyBase.length, 0),
        });

  const sentenceBase = await prisma.writingLanguageItem.findMany({
    where: {
      kind: "sentence",
      discipline: input.discipline,
      level: input.level,
      ...(masteredIds.length > 0 ? { id: { notIn: masteredIds } } : {}),
    },
    orderBy: [{ itemKey: "asc" }],
    take: input.sentenceLimit,
  });

  const sentenceFallback =
    sentenceBase.length >= input.sentenceLimit
      ? []
      : await prisma.writingLanguageItem.findMany({
          where: {
            kind: "sentence",
            id: {
              notIn: [...masteredIds, ...sentenceBase.map((item) => item.id)],
            },
          },
          orderBy: [{ itemKey: "asc" }],
          take: Math.max(input.sentenceLimit - sentenceBase.length, 0),
        });

  const selectedPack = getWritingLanguagePack(input.discipline, input.level);

  return {
    title: selectedPack?.title ?? `${input.discipline} ${input.level}`,
    vocabulary: [...vocabularyBase, ...vocabularyFallback].map(mapDatabaseItemToStoredItem),
    sentences: [...sentenceBase, ...sentenceFallback].map(mapDatabaseItemToStoredItem),
    masteredItems,
    totals: {
      all: allCount,
      mastered: masteredItems.length,
      unmastered: Math.max(0, allCount - masteredIdSet.size),
    },
  };
}

async function getWritingLanguageSnapshotFromLocalFiles(input: {
  userKey?: string;
  discipline: WritingDiscipline;
  level: CEFRLevel;
  vocabularyLimit: number;
  sentenceLimit: number;
}) {
  const userKey = normalizeUserKey(input.userKey);
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
    vocabularyBase.length >= input.vocabularyLimit
      ? vocabularyBase.slice(0, input.vocabularyLimit)
      : [
          ...vocabularyBase,
          ...findFallbackItems(
            allItemsDb.items,
            masteredIds,
            "vocabulary",
            Math.max(input.vocabularyLimit - vocabularyBase.length, 0),
          ),
        ];

  const sentences =
    sentenceBase.length >= input.sentenceLimit
      ? sentenceBase.slice(0, input.sentenceLimit)
      : [
          ...sentenceBase,
          ...findFallbackItems(
            allItemsDb.items,
            masteredIds,
            "sentence",
            Math.max(input.sentenceLimit - sentenceBase.length, 0),
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

async function markWritingLanguageItemMasteredInDatabase(input: {
  userId: string | bigint;
  itemId: string;
}) {
  const userId = normalizeUserId(input.userId);
  if (!userId) {
    return null;
  }

  const seeded = await ensureDatabaseWritingLanguageSeeded();
  if (!seeded) {
    return null;
  }

  const item = await prisma.writingLanguageItem.findUnique({
    where: {
      id: input.itemId,
    },
  });

  if (!item) {
    throw new Error("Language item not found");
  }

  await prisma.writingLanguageMastery.upsert({
    where: {
      userId_itemId: {
        userId,
        itemId: input.itemId,
      },
    },
    update: {},
    create: {
      userId,
      itemId: input.itemId,
    },
  });

  return mapDatabaseItemToStoredItem(item);
}

async function markWritingLanguageItemMasteredInLocalFiles(input: {
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

async function getMasteredWritingLanguageItemsFromDatabase(input: {
  userId: string | bigint;
}) {
  const userId = normalizeUserId(input.userId);
  if (!userId) {
    return null;
  }

  const seeded = await ensureDatabaseWritingLanguageSeeded();
  if (!seeded) {
    return null;
  }

  const mastered = await prisma.writingLanguageMastery.findMany({
    where: { userId },
    orderBy: [{ masteredAt: "desc" }, { id: "desc" }],
    include: {
      item: true,
    },
  });

  return mastered.map((entry) => ({
    ...mapDatabaseItemToStoredItem(entry.item),
    masteredAt: entry.masteredAt.toISOString(),
  }));
}

async function getMasteredWritingLanguageItemsFromLocalFiles(input: { userKey?: string }) {
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

export async function getWritingLanguageSnapshot(input: {
  userId?: string | bigint;
  userKey?: string;
  discipline: WritingDiscipline;
  level: CEFRLevel;
  vocabularyLimit?: number;
  sentenceLimit?: number;
}) {
  const vocabularyLimit = input.vocabularyLimit ?? 6;
  const sentenceLimit = input.sentenceLimit ?? 4;

  if (isDatabaseAuthConfigured() && input.userId) {
    const fromDb = await getWritingLanguageSnapshotFromDatabase({
      userId: input.userId,
      discipline: input.discipline,
      level: input.level,
      vocabularyLimit,
      sentenceLimit,
    });

    if (fromDb) {
      return fromDb;
    }
  }

  return getWritingLanguageSnapshotFromLocalFiles({
    userKey: input.userKey,
    discipline: input.discipline,
    level: input.level,
    vocabularyLimit,
    sentenceLimit,
  });
}

export async function markWritingLanguageItemMastered(input: {
  userId?: string | bigint;
  userKey?: string;
  itemId: string;
}) {
  if (isDatabaseAuthConfigured() && input.userId) {
    const fromDb = await markWritingLanguageItemMasteredInDatabase({
      userId: input.userId,
      itemId: input.itemId,
    });

    if (fromDb) {
      return fromDb;
    }
  }

  return markWritingLanguageItemMasteredInLocalFiles({
    userKey: input.userKey,
    itemId: input.itemId,
  });
}

export async function getMasteredWritingLanguageItems(input: {
  userId?: string | bigint;
  userKey?: string;
}) {
  if (isDatabaseAuthConfigured() && input.userId) {
    const fromDb = await getMasteredWritingLanguageItemsFromDatabase({
      userId: input.userId,
    });

    if (fromDb) {
      return fromDb;
    }
  }

  return getMasteredWritingLanguageItemsFromLocalFiles({
    userKey: input.userKey,
  });
}
