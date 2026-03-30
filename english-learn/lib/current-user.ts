import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const AUTH_PROVIDER_COOKIE = "demo_auth_provider";
export const AUTH_USER_ID_COOKIE = "demo_auth_user_id";
export const AUTH_USERNAME_COOKIE = "demo_auth_username";
export const AUTH_EMAIL_COOKIE = "demo_auth_email";

type CurrentAuthIdentity = {
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

async function buildUniqueUsername(base: string, authUserId: string) {
  const fallbackBase = normalizeUsername(base) || "learner";
  const suffix = authUserId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase() || "user";

  const candidates = [
    fallbackBase,
    `${fallbackBase}-${suffix}`,
    `${fallbackBase}-${suffix.slice(0, 4) || "acct"}`,
  ];

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

export async function getCurrentAuthIdentity(): Promise<CurrentAuthIdentity | null> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const username =
        normalizeUsername(
          String(user.user_metadata?.username || user.user_metadata?.name || getEmailPrefix(user.email))
        ) || `user-${user.id.slice(0, 8).toLowerCase()}`;

      return {
        authProvider: "supabase",
        authUserId: user.id,
        username,
        email: user.email ?? undefined,
        displayName: buildDisplayName(
          String(user.user_metadata?.username || user.user_metadata?.name || getEmailPrefix(user.email)),
          user.email
        ),
      };
    }
  }

  const cookieStore = await cookies();
  const authUserId = cookieStore.get(AUTH_USER_ID_COOKIE)?.value;

  if (!authUserId) {
    return null;
  }

  const authProvider = cookieStore.get(AUTH_PROVIDER_COOKIE)?.value || "local-file";
  const username =
    normalizeUsername(cookieStore.get(AUTH_USERNAME_COOKIE)?.value || "") ||
    `user-${authUserId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase()}`;
  const email = cookieStore.get(AUTH_EMAIL_COOKIE)?.value;

  return {
    authProvider,
    authUserId,
    username,
    email: email || undefined,
    displayName: buildDisplayName(cookieStore.get(AUTH_USERNAME_COOKIE)?.value, email),
  };
}

export async function requireCurrentDiscussionUser() {
  const identity = await getCurrentAuthIdentity();

  if (!identity) {
    throw new Error("UNAUTHORIZED_DISCUSSION_USER");
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

export async function getCurrentDiscussionUser() {
  const identity = await getCurrentAuthIdentity();

  if (!identity) {
    return null;
  }

  return requireCurrentDiscussionUser();
}

export async function getCurrentDiscussionUserId() {
  const user = await requireCurrentDiscussionUser();
  return user.id;
}
