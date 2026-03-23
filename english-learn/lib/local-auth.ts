import { promises as fs } from "node:fs";
import { randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { join } from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const authDbPath = join(process.cwd(), "data", "auth-users.json");

type StoredUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type AuthDatabase = {
  users: StoredUser[];
};

export type PublicAuthUser = Omit<StoredUser, "passwordHash">;

async function ensureAuthDb() {
  try {
    await fs.access(authDbPath);
  } catch {
    await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
    await fs.writeFile(authDbPath, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

async function readAuthDb(): Promise<AuthDatabase> {
  await ensureAuthDb();
  const content = await fs.readFile(authDbPath, "utf8");
  const parsed = JSON.parse(content) as Partial<AuthDatabase>;

  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
  };
}

async function writeAuthDb(db: AuthDatabase) {
  await fs.writeFile(authDbPath, JSON.stringify(db, null, 2), "utf8");
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
  const normalized = identifier.trim().toLowerCase();
  const db = await readAuthDb();

  return (
    db.users.find((user) => {
      return (
        user.email.trim().toLowerCase() === normalized ||
        user.username.trim().toLowerCase() === normalized
      );
    }) ?? null
  );
}

export async function createLocalUser(input: {
  username: string;
  email: string;
  password: string;
}) {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const db = await readAuthDb();

  const duplicate = db.users.find((user) => {
    return (
      user.email.trim().toLowerCase() === email ||
      user.username.trim().toLowerCase() === username.toLowerCase()
    );
  });

  if (duplicate) {
    throw new Error("Account or email already exists");
  }

  const user: StoredUser = {
    id: randomUUID(),
    username,
    email,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeAuthDb(db);

  return toPublicUser(user);
}

export function toPublicUser(user: StoredUser): PublicAuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}
