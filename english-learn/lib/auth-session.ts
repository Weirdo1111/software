import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

export const AUTH_SESSION_COOKIE = "english_learn_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildRawSessionToken() {
  return `${randomBytes(24).toString("hex")}.${randomBytes(24).toString("hex")}`;
}

export function createSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function createAuthSession(input: {
  userId: bigint;
  userAgent?: string | null;
  ipAddress?: string | null;
}) {
  const rawToken = buildRawSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.authSession.create({
    data: {
      userId: input.userId,
      tokenHash: hashToken(rawToken),
      expiresAt,
      userAgent: input.userAgent ?? undefined,
      ipAddress: input.ipAddress ?? undefined,
    },
  });

  return {
    rawToken,
    expiresAt,
  };
}

export async function getUserFromSessionToken(rawToken: string | null | undefined) {
  if (!rawToken) return null;

  const session = await prisma.authSession.findUnique({
    where: {
      tokenHash: hashToken(rawToken),
    },
    include: {
      user: true,
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.authSession.delete({
      where: { id: session.id },
    }).catch(() => undefined);
    return null;
  }

  await prisma.authSession.update({
    where: { id: session.id },
    data: {
      lastSeenAt: new Date(),
    },
  }).catch(() => undefined);

  return session.user;
}

export async function deleteAuthSession(rawToken: string | null | undefined) {
  if (!rawToken) return;

  await prisma.authSession.deleteMany({
    where: {
      tokenHash: hashToken(rawToken),
    },
  });
}
