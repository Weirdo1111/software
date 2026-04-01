import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { type BuddyXpAwardSource } from "@/lib/buddy-xp-config";
import { getCurrentAuthIdentity } from "@/lib/current-user";
import {
  getLocalBuddyProgress,
  awardLocalBuddyXp,
  hydrateLocalBuddyProgress,
  resetLocalBuddyProgress,
} from "@/lib/local-buddy-progress";

const countsSchema = z.object({
  listeningCompletions: z.number().int().min(0).optional(),
  speakingCompletions: z.number().int().min(0).optional(),
  readingCompletions: z.number().int().min(0).optional(),
  writingCompletions: z.number().int().min(0).optional(),
  reviewSessions: z.number().int().min(0).optional(),
  escapeRoomClears: z.number().int().min(0).optional(),
  dormLockoutClears: z.number().int().min(0).optional(),
  lastTrainClears: z.number().int().min(0).optional(),
});

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("award"),
    source: z.enum([
      "listeningCompletion",
      "speakingCompletion",
      "readingCompletion",
      "writingCompletion",
      "reviewSession",
      "escapeRoomClear",
      "dormLockoutClear",
      "lastTrainClear",
    ]),
  }),
  z.object({
    action: z.literal("reset"),
  }),
  z.object({
    action: z.literal("hydrate"),
    counts: countsSchema,
  }),
]);

function toIdentityInput(identity: NonNullable<Awaited<ReturnType<typeof getCurrentAuthIdentity>>>) {
  return {
    authProvider: identity.authProvider,
    authUserId: identity.authUserId,
    username: identity.username,
    email: identity.email,
  };
}

export async function GET() {
  try {
    const identity = await getCurrentAuthIdentity();

    if (!identity) {
      return jsonError("Please sign in first", 401);
    }

    const progress = await getLocalBuddyProgress(toIdentityInput(identity));
    return NextResponse.json({ progress });
  } catch {
    return jsonError("Failed to load buddy progress", 500);
  }
}

export async function POST(request: Request) {
  try {
    const identity = await getCurrentAuthIdentity();

    if (!identity) {
      return jsonError("Please sign in first", 401);
    }

    const payload = postSchema.parse(await request.json());
    const identityInput = toIdentityInput(identity);

    if (payload.action === "award") {
      const progress = await awardLocalBuddyXp(identityInput, payload.source as BuddyXpAwardSource);
      return NextResponse.json({ progress, awarded: true, source: payload.source });
    }

    if (payload.action === "reset") {
      const progress = await resetLocalBuddyProgress(identityInput);
      return NextResponse.json({ progress, reset: true });
    }

    const result = await hydrateLocalBuddyProgress(identityInput, payload.counts);
    return NextResponse.json({ progress: result.record, hydrated: result.hydrated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to update buddy progress", 500);
  }
}
