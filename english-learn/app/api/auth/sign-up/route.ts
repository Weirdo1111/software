import { NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_SESSION_COOKIE, createAuthSession, createSessionCookieOptions } from "@/lib/auth-session";
import { jsonError } from "@/lib/api";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_PROVIDER_COOKIE,
  AUTH_USER_ID_COOKIE,
  AUTH_USERNAME_COOKIE,
} from "@/lib/current-user";
import { createLocalUser, findLocalUserByLogin } from "@/lib/local-auth";

const schema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    try {
      const fallbackUsername = payload.email.split("@")[0]?.slice(0, 24) || "learner";
      const user = await createLocalUser({
        ...payload,
        username: payload.username?.trim() || fallbackUsername,
      });
      const createdUser = await findLocalUserByLogin(user.email ?? payload.email);

      if (!createdUser) {
        return jsonError("Failed to create account session", 500);
      }

      const session = await createAuthSession({
        userId: createdUser.id,
        userAgent: request.headers.get("user-agent"),
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip"),
      });

      const response = NextResponse.json({
        user,
        user_id: user.id,
        session: true,
        storage: "database",
      });

      response.cookies.set(
        AUTH_SESSION_COOKIE,
        session.rawToken,
        createSessionCookieOptions(session.expiresAt),
      );
      response.cookies.set(AUTH_PROVIDER_COOKIE, createdUser.authProvider, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: session.expiresAt,
      });
      response.cookies.set(AUTH_USER_ID_COOKIE, createdUser.authUserId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: session.expiresAt,
      });
      response.cookies.set(AUTH_USERNAME_COOKIE, createdUser.username, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: session.expiresAt,
      });
      if (createdUser.email) {
        response.cookies.set(AUTH_EMAIL_COOKIE, createdUser.email, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          expires: session.expiresAt,
        });
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        return jsonError(error.message, 409);
      }

      return jsonError("Failed to sign up", 500);
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to sign up", 500);
  }
}
