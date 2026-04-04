import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import { isDatabaseAuthConfigured } from "@/lib/local-auth";
import {
  getMasteredWritingLanguageItems,
  getWritingLanguageSnapshot,
  markWritingLanguageItemMastered,
} from "@/lib/writing-language-progress";

const snapshotQuerySchema = z.object({
  userKey: z.string().optional(),
  discipline: z.enum(["computing", "transport", "maths", "mechanical", "civil"]).optional(),
  level: z.enum(["A1", "A2", "B1", "B2"]).optional(),
  view: z.enum(["study", "mastered"]).optional(),
});

const markMasteredSchema = z.object({
  userKey: z.string().optional(),
  itemId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const query = snapshotQuerySchema.parse({
      userKey: request.nextUrl.searchParams.get("userKey") ?? undefined,
      discipline: request.nextUrl.searchParams.get("discipline") ?? undefined,
      level: request.nextUrl.searchParams.get("level") ?? undefined,
      view: request.nextUrl.searchParams.get("view") ?? undefined,
    });
    const userId = isDatabaseAuthConfigured() ? await resolveRequestUserId(request) : undefined;

    if (query.view === "mastered") {
      const items = await getMasteredWritingLanguageItems({
        userId,
        userKey: query.userKey,
      });
      return NextResponse.json({ items });
    }

    const snapshot = await getWritingLanguageSnapshot({
      userId,
      userKey: query.userKey,
      discipline: query.discipline ?? "computing",
      level: query.level ?? "B1",
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid query", 422);
    }

    return jsonError("Failed to load writing language items", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = markMasteredSchema.parse(await request.json());
    const userId = isDatabaseAuthConfigured() ? await resolveRequestUserId(request) : undefined;
    const item = await markWritingLanguageItemMastered({
      userId,
      userKey: payload.userKey,
      itemId: payload.itemId,
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    const message = error instanceof Error ? error.message : "Failed to update writing language progress";
    return jsonError(message, 400);
  }
}
