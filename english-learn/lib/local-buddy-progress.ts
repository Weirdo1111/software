import { promises as fs } from "node:fs";
import { join } from "node:path";

import { type BuddyXpAwardSource, getBuddyXpForSource } from "@/lib/buddy-xp-config";

const dataDirPath = join(process.cwd(), "data");
const buddyProgressDbPath = join(dataDirPath, "buddy-progress.json");

export interface BuddyProgressCounts {
  listeningCompletions: number;
  speakingCompletions: number;
  readingCompletions: number;
  writingCompletions: number;
  reviewSessions: number;
  escapeRoomClears: number;
  dormLockoutClears: number;
  lastTrainClears: number;
}

export interface BuddyProgressRecord {
  authProvider: string;
  authUserId: string;
  username: string;
  email?: string;
  totalXp: number;
  totalCompletedSources: number;
  counts: BuddyProgressCounts;
  createdAt: string;
  updatedAt: string;
}

type BuddyProgressDatabase = {
  records: BuddyProgressRecord[];
};

function createEmptyCounts(): BuddyProgressCounts {
  return {
    listeningCompletions: 0,
    speakingCompletions: 0,
    readingCompletions: 0,
    writingCompletions: 0,
    reviewSessions: 0,
    escapeRoomClears: 0,
    dormLockoutClears: 0,
    lastTrainClears: 0,
  };
}

function createEmptyRecord(input: {
  authProvider: string;
  authUserId: string;
  username: string;
  email?: string;
}): BuddyProgressRecord {
  const now = new Date().toISOString();
  return {
    authProvider: input.authProvider,
    authUserId: input.authUserId,
    username: input.username,
    email: input.email,
    totalXp: 0,
    totalCompletedSources: 0,
    counts: createEmptyCounts(),
    createdAt: now,
    updatedAt: now,
  };
}

function cloneCounts(counts?: Partial<BuddyProgressCounts>): BuddyProgressCounts {
  return {
    listeningCompletions: Math.max(0, Math.floor(counts?.listeningCompletions ?? 0)),
    speakingCompletions: Math.max(0, Math.floor(counts?.speakingCompletions ?? 0)),
    readingCompletions: Math.max(0, Math.floor(counts?.readingCompletions ?? 0)),
    writingCompletions: Math.max(0, Math.floor(counts?.writingCompletions ?? 0)),
    reviewSessions: Math.max(0, Math.floor(counts?.reviewSessions ?? 0)),
    escapeRoomClears: Math.max(0, Math.floor(counts?.escapeRoomClears ?? 0)),
    dormLockoutClears: Math.max(0, Math.floor(counts?.dormLockoutClears ?? 0)),
    lastTrainClears: Math.max(0, Math.floor(counts?.lastTrainClears ?? 0)),
  };
}

function sumCompletedSources(counts: BuddyProgressCounts) {
  return (
    counts.listeningCompletions +
    counts.speakingCompletions +
    counts.readingCompletions +
    counts.writingCompletions +
    counts.reviewSessions +
    counts.escapeRoomClears +
    counts.dormLockoutClears +
    counts.lastTrainClears
  );
}

function sumTotalXp(counts: BuddyProgressCounts) {
  return (
    counts.listeningCompletions * getBuddyXpForSource("listeningCompletion") +
    counts.speakingCompletions * getBuddyXpForSource("speakingCompletion") +
    counts.readingCompletions * getBuddyXpForSource("readingCompletion") +
    counts.writingCompletions * getBuddyXpForSource("writingCompletion") +
    counts.reviewSessions * getBuddyXpForSource("reviewSession") +
    counts.escapeRoomClears * getBuddyXpForSource("escapeRoomClear") +
    counts.dormLockoutClears * getBuddyXpForSource("dormLockoutClear") +
    counts.lastTrainClears * getBuddyXpForSource("lastTrainClear")
  );
}

function normalizeRecord(record: Partial<BuddyProgressRecord>): BuddyProgressRecord | null {
  if (!record.authProvider || !record.authUserId || !record.username) {
    return null;
  }

  const counts = cloneCounts(record.counts);
  const createdAt =
    typeof record.createdAt === "string" && record.createdAt.trim().length > 0
      ? record.createdAt
      : new Date().toISOString();
  const updatedAt =
    typeof record.updatedAt === "string" && record.updatedAt.trim().length > 0
      ? record.updatedAt
      : createdAt;

  return {
    authProvider: record.authProvider,
    authUserId: record.authUserId,
    username: record.username,
    email: record.email,
    counts,
    totalXp: sumTotalXp(counts),
    totalCompletedSources: sumCompletedSources(counts),
    createdAt,
    updatedAt,
  };
}

async function ensureBuddyProgressDb() {
  try {
    await fs.access(buddyProgressDbPath);
  } catch {
    await fs.mkdir(dataDirPath, { recursive: true });
    await fs.writeFile(buddyProgressDbPath, JSON.stringify({ records: [] }, null, 2), "utf8");
  }
}

async function readBuddyProgressDb(): Promise<BuddyProgressDatabase> {
  await ensureBuddyProgressDb();
  const content = await fs.readFile(buddyProgressDbPath, "utf8");
  const parsed = JSON.parse(content) as Partial<BuddyProgressDatabase>;

  return {
    records: Array.isArray(parsed.records)
      ? parsed.records
          .map((record) => normalizeRecord(record as Partial<BuddyProgressRecord>))
          .filter((record): record is BuddyProgressRecord => Boolean(record))
      : [],
  };
}

async function writeBuddyProgressDb(db: BuddyProgressDatabase) {
  await fs.writeFile(buddyProgressDbPath, JSON.stringify(db, null, 2), "utf8");
}

function applyAwardToCounts(counts: BuddyProgressCounts, source: BuddyXpAwardSource) {
  const next = { ...counts };

  if (source === "listeningCompletion") next.listeningCompletions += 1;
  if (source === "speakingCompletion") next.speakingCompletions += 1;
  if (source === "readingCompletion") next.readingCompletions += 1;
  if (source === "writingCompletion") next.writingCompletions += 1;
  if (source === "reviewSession") next.reviewSessions += 1;
  if (source === "escapeRoomClear") next.escapeRoomClears = 1;
  if (source === "dormLockoutClear") next.dormLockoutClears = 1;
  if (source === "lastTrainClear") next.lastTrainClears = 1;

  return next;
}

function buildRecordWithCounts(record: BuddyProgressRecord, counts: BuddyProgressCounts): BuddyProgressRecord {
  return {
    ...record,
    counts,
    totalXp: sumTotalXp(counts),
    totalCompletedSources: sumCompletedSources(counts),
    updatedAt: new Date().toISOString(),
  };
}

export async function getLocalBuddyProgress(input: {
  authProvider: string;
  authUserId: string;
  username: string;
  email?: string;
}) {
  const db = await readBuddyProgressDb();
  const existing = db.records.find((record) => {
    return record.authProvider === input.authProvider && record.authUserId === input.authUserId;
  });

  if (existing) {
    let needsWrite = false;
    let nextRecord = existing;

    if (existing.username !== input.username || existing.email !== input.email) {
      nextRecord = {
        ...existing,
        username: input.username,
        email: input.email,
        updatedAt: new Date().toISOString(),
      };
      needsWrite = true;
    }

    if (needsWrite) {
      db.records = db.records.map((record) =>
        record.authProvider === input.authProvider && record.authUserId === input.authUserId ? nextRecord : record
      );
      await writeBuddyProgressDb(db);
    }

    return nextRecord;
  }

  const created = createEmptyRecord(input);
  db.records.push(created);
  await writeBuddyProgressDb(db);
  return created;
}

export async function awardLocalBuddyXp(
  input: {
    authProvider: string;
    authUserId: string;
    username: string;
    email?: string;
  },
  source: BuddyXpAwardSource
) {
  const db = await readBuddyProgressDb();
  const existingIndex = db.records.findIndex((record) => {
    return record.authProvider === input.authProvider && record.authUserId === input.authUserId;
  });

  const baseRecord =
    existingIndex >= 0 ? db.records[existingIndex] : createEmptyRecord(input);
  const nextCounts = applyAwardToCounts(baseRecord.counts, source);
  const nextRecord = buildRecordWithCounts(
    {
      ...baseRecord,
      username: input.username,
      email: input.email,
    },
    nextCounts
  );

  if (existingIndex >= 0) {
    db.records[existingIndex] = nextRecord;
  } else {
    db.records.push(nextRecord);
  }

  await writeBuddyProgressDb(db);
  return nextRecord;
}

export async function hydrateLocalBuddyProgress(
  input: {
    authProvider: string;
    authUserId: string;
    username: string;
    email?: string;
  },
  counts: Partial<BuddyProgressCounts>
) {
  const db = await readBuddyProgressDb();
  const existingIndex = db.records.findIndex((record) => {
    return record.authProvider === input.authProvider && record.authUserId === input.authUserId;
  });

  const baseRecord =
    existingIndex >= 0 ? db.records[existingIndex] : createEmptyRecord(input);

  if (baseRecord.totalXp > 0 || baseRecord.totalCompletedSources > 0) {
    return {
      record: baseRecord,
      hydrated: false,
    };
  }

  const nextRecord = buildRecordWithCounts(
    {
      ...baseRecord,
      username: input.username,
      email: input.email,
    },
    cloneCounts(counts)
  );

  if (existingIndex >= 0) {
    db.records[existingIndex] = nextRecord;
  } else {
    db.records.push(nextRecord);
  }

  await writeBuddyProgressDb(db);
  return {
    record: nextRecord,
    hydrated: true,
  };
}

export async function resetLocalBuddyProgress(input: {
  authProvider: string;
  authUserId: string;
  username: string;
  email?: string;
}) {
  const db = await readBuddyProgressDb();
  const existingIndex = db.records.findIndex((record) => {
    return record.authProvider === input.authProvider && record.authUserId === input.authUserId;
  });

  const nextRecord = createEmptyRecord(input);

  if (existingIndex >= 0) {
    db.records[existingIndex] = nextRecord;
  } else {
    db.records.push(nextRecord);
  }

  await writeBuddyProgressDb(db);
  return nextRecord;
}
