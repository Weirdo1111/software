import { promises as fs } from "node:fs";
import { randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { join } from "node:path";
import { promisify } from "node:util";

import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const authDbPath = join(process.cwd(), "data", "auth-users.json");

type LegacyStoredUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type AuthDatabase = {
  users: LegacyStoredUser[];
};

export type PublicAuthUser = {
  id: string;
  username: string;
  email: string | null;
  createdAt: string;
};

export type LocalAuthUserRecord = {
  id: string | bigint;
  username: string;
  email: string | null;
  passwordHash: string | null;
  createdAt: string | Date;
  authProvider: string;
  authUserId: string;
  displayName?: string;
  lastLoginAt?: Date | null;
};

let legacyUsersImportPromise: Promise<void> | null = null;

export function isDatabaseAuthConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function readLegacyAuthDb(): Promise<AuthDatabase> {
  try {
    const content = await fs.readFile(authDbPath, "utf8");
    const parsed = JSON.parse(content) as Partial<AuthDatabase>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { users: [] };
  }
}

async function writeLegacyAuthDb(db: AuthDatabase) {
  await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(authDbPath, JSON.stringify(db, null, 2), "utf8");
}

function toLegacyLocalAuthUser(user: LegacyStoredUser): LocalAuthUserRecord {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    authProvider: "local-file",
    authUserId: user.id,
    displayName: user.username,
    lastLoginAt: null,
  };
}

async function findLegacyUserByLogin(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  const db = await readLegacyAuthDb();
  const matched = db.users.find((user) => {
    return (
      user.id === identifier.trim() ||
      user.username.trim() === identifier.trim() ||
      user.username.trim().toLowerCase() === normalized ||
      toNormalizedEmail(user.email) === normalized
    );
  });

  return matched ? toLegacyLocalAuthUser(matched) : null;
}

async function findLegacyUserByAuthIdentity(authProvider: string, authUserId: string) {
  if (authProvider !== "local-file" && authProvider !== "database") {
    return null;
  }

  const db = await readLegacyAuthDb();
  const matched = db.users.find((user) => user.id === authUserId);
  return matched ? toLegacyLocalAuthUser(matched) : null;
}

function toNormalizedEmail(value: string) {
  return value.trim().toLowerCase();
}

async function ensureLegacyUsersImported() {
  if (!isDatabaseAuthConfigured()) {
    return;
  }

  if (!legacyUsersImportPromise) {
    legacyUsersImportPromise = (async () => {
      const db = await readLegacyAuthDb();

      for (const legacyUser of db.users) {
        const username = legacyUser.username.trim();
        const email = toNormalizedEmail(legacyUser.email);

        const existing =
          (await prisma.user.findUnique({
            where: {
              authProvider_authUserId: {
                authProvider: "local-file",
                authUserId: legacyUser.id,
              },
            },
          })) ??
          (await prisma.user.findFirst({
            where: {
              OR: [{ username }, { email }],
            },
          }));

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              username,
              email,
              displayName: existing.displayName || username,
              authProvider: existing.authProvider === "database" ? existing.authProvider : "local-file",
              authUserId: existing.authProvider === "database" ? existing.authUserId : legacyUser.id,
              passwordHash: existing.passwordHash ?? legacyUser.passwordHash,
              createdAt: existing.createdAt,
            },
          });
          continue;
        }

        await prisma.user.create({
          data: {
            username,
            email,
            displayName: username,
            authProvider: "local-file",
            authUserId: legacyUser.id,
            passwordHash: legacyUser.passwordHash,
            createdAt: new Date(legacyUser.createdAt),
          },
        });
      }
    })().catch((error) => {
      legacyUsersImportPromise = null;
      throw error;
    });
  }

  await legacyUsersImportPromise;
}

export async function hashPassword(password: string) {
  const salt = randomUUID().replace(/-/g, "");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, savedHash] = passwordHash.split(":");

  if (!salt || !savedHash) {
    return false;
  }

  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const savedBuffer = Buffer.from(savedHash, "hex");

  if (savedBuffer.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(savedBuffer, derived);
}

export async function findLocalUserByLogin(identifier: string) {
  if (!isDatabaseAuthConfigured()) {
    return findLegacyUserByLogin(identifier);
  }

  try {
    const normalized = identifier.trim().toLowerCase();
    await ensureLegacyUsersImported();

    return await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalized },
          { username: identifier.trim() },
          { username: normalized },
        ],
      },
    });
  } catch {
    return findLegacyUserByLogin(identifier);
  }
}

export async function findLocalUserByAuthIdentity(authProvider: string, authUserId: string) {
  if (!authProvider || !authUserId) {
    return null;
  }

  if (!isDatabaseAuthConfigured()) {
    return findLegacyUserByAuthIdentity(authProvider, authUserId);
  }

  try {
    await ensureLegacyUsersImported();
    return await prisma.user.findUnique({
      where: {
        authProvider_authUserId: {
          authProvider,
          authUserId,
        },
      },
    });
  } catch {
    return findLegacyUserByAuthIdentity(authProvider, authUserId);
  }
}

export async function createLocalUser(input: {
  username: string;
  email: string;
  password: string;
}) {
  const username = input.username.trim();
  const email = toNormalizedEmail(input.email);

  if (!isDatabaseAuthConfigured()) {
    const db = await readLegacyAuthDb();
    const duplicate = db.users.find((user) => {
      return user.username.trim().toLowerCase() === username.toLowerCase() || toNormalizedEmail(user.email) === email;
    });

    if (duplicate) {
      throw new Error("Account or email already exists");
    }

    const created: LegacyStoredUser = {
      id: randomUUID(),
      username,
      email,
      passwordHash: await hashPassword(input.password),
      createdAt: new Date().toISOString(),
    };

    db.users.push(created);
    await writeLegacyAuthDb(db);
    return toPublicUser({
      id: created.id,
      username: created.username,
      email: created.email,
      createdAt: created.createdAt,
    });
  }

  await ensureLegacyUsersImported();

  const duplicate = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (duplicate) {
    throw new Error("Account or email already exists");
  }

  const created = await prisma.user.create({
    data: {
      username,
      email,
      displayName: username,
      authProvider: "database",
      authUserId: randomUUID(),
      passwordHash: await hashPassword(input.password),
    },
  });

  return toPublicUser(created);
}

export function toPublicUser(user: {
  id: bigint | string;
  username: string;
  email: string | null;
  createdAt: Date | string;
}) {
  return {
    id: typeof user.id === "bigint" ? user.id.toString() : user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  } satisfies PublicAuthUser;
}
