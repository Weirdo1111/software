import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const AUTH_SESSION_COOKIE = "english_learn_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
type CookieRequestContext = Headers | Request | null | undefined;

const sessionUserSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  authProvider: true,
  authUserId: true,
} satisfies Prisma.UserSelect;

function isDatabaseSessionConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildRawSessionToken() {
  return `${randomBytes(24).toString("hex")}.${randomBytes(24).toString("hex")}`;
}

function resolveCookieRequestHeaders(context: CookieRequestContext) {
  if (!context) {
    return null;
  }

  return context instanceof Headers ? context : context.headers;
}

function resolveCookieRequestProtocol(context: CookieRequestContext) {
  const headers = resolveCookieRequestHeaders(context);
  const forwardedProto = headers?.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();

  if (forwardedProto === "https" || forwardedProto === "http") {
    return forwardedProto;
  }

  if (!context || context instanceof Headers) {
    return null;
  }

  try {
    return new URL(context.url).protocol.replace(":", "");
  } catch {
    return null;
  }
}

export function shouldUseSecureAuthCookies(context?: CookieRequestContext) {
  const secureOverride = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();

  if (secureOverride === "true") {
    return true;
  }

  if (secureOverride === "false") {
    return false;
  }

  const requestProtocol = resolveCookieRequestProtocol(context);

  if (requestProtocol === "https") {
    return true;
  }

  if (requestProtocol === "http") {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

export function createSessionCookieOptions(expiresAt: Date, context?: CookieRequestContext) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureAuthCookies(context),
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

  if (!isDatabaseSessionConfigured()) {
    return {
      rawToken,
      expiresAt,
    };
  }

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
  if (!rawToken || !isDatabaseSessionConfigured()) return null;

  const session = await prisma.authSession.findUnique({
    where: {
      tokenHash: hashToken(rawToken),
    },
    include: {
      user: {
        select: sessionUserSelect,
      },
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
  if (!rawToken || !isDatabaseSessionConfigured()) return;

  await prisma.authSession.deleteMany({
    where: {
      tokenHash: hashToken(rawToken),
    },
  });
}
