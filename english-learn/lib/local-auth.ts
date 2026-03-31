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

let legacyUsersImportPromise: Promise<void> | null = null;

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

function toNormalizedEmail(value: string) {
  return value.trim().toLowerCase();
}

async function ensureLegacyUsersImported() {
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
  await ensureLegacyUsersImported();

  const normalized = identifier.trim().toLowerCase();
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: normalized },
        { username: identifier.trim() },
        { username: normalized },
      ],
    },
  });
}

export async function createLocalUser(input: {
  username: string;
  email: string;
  password: string;
}) {
  await ensureLegacyUsersImported();

  const username = input.username.trim();
  const email = toNormalizedEmail(input.email);

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
  id: bigint;
  username: string;
  email: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id.toString(),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  } satisfies PublicAuthUser;
}
