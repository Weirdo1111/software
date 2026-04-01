import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { findLocalUserByLogin } from "@/lib/local-auth";
import { prisma } from "@/lib/prisma";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getRequestUserId(request: Request) {
  return request.headers.get("x-user-id") || DEMO_USER_ID;
}

async function findUserByHeaderUserId(rawUserId: string) {
  const normalized = rawUserId.trim();

  if (/^\d+$/.test(normalized)) {
    return prisma.user.findUnique({
      where: { id: BigInt(normalized) },
    });
  }

  const byComposite = await prisma.user.findUnique({
    where: {
      authProvider_authUserId: {
        authProvider: "local-file",
        authUserId: normalized,
      },
    },
  });

  if (byComposite) {
    return byComposite;
  }

  return findLocalUserByLogin(normalized);
}

async function ensureFallbackDemoUserId() {
  const demoUser =
    (await prisma.user.findFirst({
      where: {
        OR: [{ username: "admin" }, { authProvider: "local-file", authUserId: DEMO_USER_ID }],
      },
    })) ??
    (await findLocalUserByLogin("admin"));

  if (!demoUser) {
    throw new Error("DEFAULT_DEMO_USER_NOT_FOUND");
  }

  return demoUser.id;
}

export async function resolveRequestUser(request: Request) {
  const headerUserId = request.headers.get("x-user-id");

  if (headerUserId) {
    const headerUser = await findUserByHeaderUserId(headerUserId);
    if (headerUser) {
      return headerUser;
    }
  }

  return getCurrentUser();
}

export async function resolveRequestUserId(request: Request) {
  const currentUser = await resolveRequestUser(request);

  if (currentUser) {
    return currentUser.id;
  }

  return ensureFallbackDemoUserId();
}
