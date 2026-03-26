import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_PROVIDER_COOKIE,
  AUTH_USER_ID_COOKIE,
  AUTH_USERNAME_COOKIE,
} from "@/lib/current-user";
import { findLocalUserByLogin, toPublicUser, verifyPassword } from "@/lib/local-auth";

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

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      const user = await findLocalUserByLogin(loginIdentifier);

      if (!user) {
        return jsonError("Invalid account or password", 400);
      }

      const validPassword = await verifyPassword(payload.password, user.passwordHash);

      if (!validPassword) {
        return jsonError("Invalid account or password", 400);
      }

      const response = NextResponse.json({
        user: toPublicUser(user),
        user_id: user.id,
        session: true,
        storage: "local-file",
      });

      response.cookies.set(AUTH_PROVIDER_COOKIE, "local-file", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set(AUTH_USER_ID_COOKIE, user.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set(AUTH_USERNAME_COOKIE, user.username, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set(AUTH_EMAIL_COOKIE, user.email, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });

      return response;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginIdentifier,
      password: payload.password,
    });

    if (error) {
      return jsonError(error.message, 400);
    }

    const response = NextResponse.json({ user_id: data.user.id, session: Boolean(data.session) });

    if (data.user) {
      response.cookies.set(AUTH_PROVIDER_COOKIE, "supabase", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set(AUTH_USER_ID_COOKIE, data.user.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set(
        AUTH_USERNAME_COOKIE,
        String(data.user.user_metadata?.username || data.user.email?.split("@")[0] || "learner"),
        {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        }
      );
      if (data.user.email) {
        response.cookies.set(AUTH_EMAIL_COOKIE, data.user.email, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        });
      }
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to sign in", 500);
  }
}
