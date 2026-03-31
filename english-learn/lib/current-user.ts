import { cookies } from "next/headers";

import { AUTH_SESSION_COOKIE, getUserFromSessionToken } from "@/lib/auth-session";
import { findLocalUserByAuthIdentity, findLocalUserByLogin, isDatabaseAuthConfigured } from "@/lib/local-auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const AUTH_PROVIDER_COOKIE = "demo_auth_provider";
export const AUTH_USER_ID_COOKIE = "demo_auth_user_id";
export const AUTH_USERNAME_COOKIE = "demo_auth_username";
export const AUTH_EMAIL_COOKIE = "demo_auth_email";

type CurrentAuthIdentity = {
  userId?: bigint;
  authProvider: string;
  authUserId: string;
  username: string;
  email?: string;
  displayName: string;
};

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function getEmailPrefix(email?: string | null) {
  return email?.split("@")[0]?.trim() ?? "";
}

function buildDisplayName(username?: string, email?: string) {
  return username?.trim() || getEmailPrefix(email) || "Learner";
}

function buildIdentityFromUser(user: {
  id: bigint | string;
  authProvider?: string;
  authUserId?: string;
  username: string;
  email: string | null | undefined;
  displayName?: string;
}) {
  const authProvider = user.authProvider || "local-file";
  const authUserId =
    user.authUserId ||
    (typeof user.id === "bigint" ? user.id.toString() : user.id);
  const normalizedUsername = normalizeUsername(user.username) || `user-${authUserId}`;

  return {
    userId: typeof user.id === "bigint" ? user.id : undefined,
    authProvider,
    authUserId,
    username: normalizedUsername,
    email: user.email ?? undefined,
    displayName: user.displayName || buildDisplayName(user.username, user.email ?? undefined),
  } satisfies CurrentAuthIdentity;
}

async function buildUniqueUsername(base: string, authUserId: string) {
  const fallbackBase = normalizeUsername(base) || "learner";
  const suffix =
    authUserId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase() || "user";

  const candidates = [
    fallbackBase,
    `${fallbackBase}-${suffix}`,
    `${fallbackBase}-${suffix.slice(0, 4) || "acct"}`,
  ];

  if (!isDatabaseAuthConfigured()) {
    return candidates[0];
  }

  for (const candidate of candidates) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${fallbackBase}-${Date.now().toString().slice(-6)}`;
}

async function getIdentityFromCookies() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionToken && isDatabaseAuthConfigured()) {
    const sessionUser = await getUserFromSessionToken(sessionToken);
    if (sessionUser) {
      return buildIdentityFromUser(sessionUser);
    }
  }

  const authProvider = cookieStore.get(AUTH_PROVIDER_COOKIE)?.value;
  const authUserId = cookieStore.get(AUTH_USER_ID_COOKIE)?.value;

  if (authProvider && authUserId) {
    const existing = isDatabaseAuthConfigured()
      ? await prisma.user.findUnique({
          where: {
            authProvider_authUserId: {
              authProvider,
              authUserId,
            },
          },
        })
      : await findLocalUserByAuthIdentity(authProvider, authUserId);

    if (existing) {
      return buildIdentityFromUser(existing);
    }

    const usernameCookie = cookieStore.get(AUTH_USERNAME_COOKIE)?.value;
    const emailCookie = cookieStore.get(AUTH_EMAIL_COOKIE)?.value;

    return {
      authProvider,
      authUserId,
      username:
        normalizeUsername(usernameCookie || "") ||
        `user-${authUserId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase()}`,
      email: emailCookie || undefined,
      displayName: buildDisplayName(usernameCookie, emailCookie || undefined),
    } satisfies CurrentAuthIdentity;
  }

  const emailCookie = cookieStore.get(AUTH_EMAIL_COOKIE)?.value;
  const usernameCookie = cookieStore.get(AUTH_USERNAME_COOKIE)?.value;

  if (emailCookie || usernameCookie) {
    const existing = isDatabaseAuthConfigured()
      ? await prisma.user.findFirst({
          where: {
            OR: [
              emailCookie ? { email: emailCookie } : undefined,
              usernameCookie ? { username: usernameCookie } : undefined,
            ].filter(Boolean) as Array<{ email?: string; username?: string }>,
          },
        })
      : await findLocalUserByLogin(emailCookie || usernameCookie || "");

    if (existing) {
      return buildIdentityFromUser(existing);
    }
  }

  return null;
}

async function getIdentityFromSupabase(): Promise<CurrentAuthIdentity | null> {
  if (!isDatabaseAuthConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const username =
    normalizeUsername(
      String(user.user_metadata?.username || user.user_metadata?.name || getEmailPrefix(user.email)),
    ) || `user-${user.id.slice(0, 8).toLowerCase()}`;

  const existing = await prisma.user.findUnique({
    where: {
      authProvider_authUserId: {
        authProvider: "supabase",
        authUserId: user.id,
      },
    },
  });

  if (existing) {
    return buildIdentityFromUser(existing);
  }

  return {
    authProvider: "supabase",
    authUserId: user.id,
    username,
    email: user.email ?? undefined,
    displayName: buildDisplayName(
      String(user.user_metadata?.username || user.user_metadata?.name || getEmailPrefix(user.email)),
      user.email,
    ),
  };
}

export async function getCurrentAuthIdentity(): Promise<CurrentAuthIdentity | null> {
  const cookieIdentity = await getIdentityFromCookies();
  if (cookieIdentity) {
    return cookieIdentity;
  }

  return getIdentityFromSupabase();
}

export async function requireCurrentUser() {
  const identity = await getCurrentAuthIdentity();

  if (!identity) {
    throw new Error("UNAUTHORIZED_DISCUSSION_USER");
  }

  if (!isDatabaseAuthConfigured()) {
    const existing =
      (await findLocalUserByAuthIdentity(identity.authProvider, identity.authUserId)) ??
      (identity.email ? await findLocalUserByLogin(identity.email) : null) ??
      (await findLocalUserByLogin(identity.username));

    if (existing) {
      return existing;
    }

    throw new Error("UNAUTHORIZED_DISCUSSION_USER");
  }

  if (identity.userId) {
    const existingById = await prisma.user.findUnique({
      where: { id: identity.userId },
    });

    if (existingById) {
      return existingById;
    }
  }

  const existing = await prisma.user.findUnique({
    where: {
      authProvider_authUserId: {
        authProvider: identity.authProvider,
        authUserId: identity.authUserId,
      },
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        email: identity.email ?? existing.email,
        displayName: identity.displayName || existing.displayName,
        username: existing.username,
      },
    });
  }

  const username = await buildUniqueUsername(identity.username, identity.authUserId);

  return prisma.user.create({
    data: {
      username,
      authProvider: identity.authProvider,
      authUserId: identity.authUserId,
      email: identity.email,
      displayName: identity.displayName,
    },
  });
}

export async function getCurrentUser() {
  const identity = await getCurrentAuthIdentity();

  if (!identity) {
    return null;
  }

  return requireCurrentUser();
}

export async function getCurrentUserId() {
  const user = await requireCurrentUser();
  return user.id;
}

export async function requireCurrentDiscussionUser() {
  return requireCurrentUser();
}

export async function getCurrentDiscussionUser() {
  return getCurrentUser();
}

export async function getCurrentDiscussionUserId() {
  return getCurrentUserId();
}
