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
import { createLocalUser } from "@/lib/local-auth";

const schema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      try {
        const fallbackUsername = payload.email.split("@")[0]?.slice(0, 24) || "learner";
        const user = await createLocalUser({
          ...payload,
          username: payload.username?.trim() || fallbackUsername,
        });

        const response = NextResponse.json({
          user,
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
      } catch (error) {
        if (error instanceof Error) {
          return jsonError(error.message, 409);
        }

        return jsonError("Failed to sign up", 500);
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      return jsonError(error.message, 400);
    }

    const response = NextResponse.json({ user_id: data.user?.id, session: Boolean(data.session) });

    if (data.user?.id) {
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
        payload.username?.trim() || data.user.email?.split("@")[0] || "learner",
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

    return jsonError("Failed to sign up", 500);
  }
}
