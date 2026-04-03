import { NextResponse } from "next/server";
import { z } from "zod";

import { createAuthSession, createSessionCookieOptions, AUTH_SESSION_COOKIE } from "@/lib/auth-session";
import { jsonError } from "@/lib/api";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_PROVIDER_COOKIE,
  AUTH_USER_ID_COOKIE,
  AUTH_USERNAME_COOKIE,
} from "@/lib/current-user";
import { getLocalBuddyProgress } from "@/lib/local-buddy-progress";
import {
  findLocalUserByLogin,
  isDatabaseAuthConfigured,
  toPublicUser,
  verifyPassword,
} from "@/lib/local-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email().optional(),
  identifier: z.string().min(1).optional(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const loginIdentifier = payload.email ?? payload.identifier;

    if (!loginIdentifier) {
      return jsonError("Email or account is required", 422);
    }

    const user = await findLocalUserByLogin(loginIdentifier);

    if (!user || !user.passwordHash) {
      return jsonError("Invalid account or password", 400);
    }

    const validPassword = await verifyPassword(payload.password, user.passwordHash);

    if (!validPassword) {
      return jsonError("Invalid account or password", 400);
    }

    const updatedUser =
      isDatabaseAuthConfigured() && typeof user.id === "bigint"
        ? await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
            },
          })
        : user;

    await getLocalBuddyProgress({
      authProvider: updatedUser.authProvider || "local-file",
      authUserId:
        updatedUser.authUserId ||
        (typeof updatedUser.id === "bigint" ? updatedUser.id.toString() : updatedUser.id),
      username: updatedUser.username,
      email: updatedUser.email ?? undefined,
    });

    const session =
      isDatabaseAuthConfigured() && typeof updatedUser.id === "bigint"
        ? await createAuthSession({
            userId: updatedUser.id,
            userAgent: request.headers.get("user-agent"),
            ipAddress:
              request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
              request.headers.get("x-real-ip"),
          })
        : null;

    const authProvider = updatedUser.authProvider || "local-file";
    const authUserId =
      updatedUser.authUserId ||
      (typeof updatedUser.id === "bigint" ? updatedUser.id.toString() : updatedUser.id);

    const usesDatabaseStorage = typeof updatedUser.id === "bigint";

    const response = NextResponse.json({
      user: toPublicUser(updatedUser),
      user_id: typeof updatedUser.id === "bigint" ? updatedUser.id.toString() : updatedUser.id,
      auth_provider: authProvider,
      auth_user_id: authUserId,
      session: Boolean(session),
      storage: usesDatabaseStorage ? "database" : "local-file",
    });

    if (session) {
      response.cookies.set(
        AUTH_SESSION_COOKIE,
        session.rawToken,
        createSessionCookieOptions(session.expiresAt),
      );
    }

    const cookieExpires = session?.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

    response.cookies.set(AUTH_PROVIDER_COOKIE, authProvider, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: cookieExpires,
    });
    response.cookies.set(AUTH_USER_ID_COOKIE, authUserId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: cookieExpires,
    });
    response.cookies.set(AUTH_USERNAME_COOKIE, updatedUser.username, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: cookieExpires,
    });
    if (updatedUser.email) {
      response.cookies.set(AUTH_EMAIL_COOKIE, updatedUser.email, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: cookieExpires,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to sign in", 500);
  }
}
