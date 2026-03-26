import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
  const query = snapshotQuerySchema.parse({
    userKey: request.nextUrl.searchParams.get("userKey") ?? undefined,
    discipline: request.nextUrl.searchParams.get("discipline") ?? undefined,
    level: request.nextUrl.searchParams.get("level") ?? undefined,
    view: request.nextUrl.searchParams.get("view") ?? undefined,
  });

  if (query.view === "mastered") {
    const items = await getMasteredWritingLanguageItems({ userKey: query.userKey });
    return NextResponse.json({ items });
  }

  const snapshot = await getWritingLanguageSnapshot({
    userKey: query.userKey,
    discipline: query.discipline ?? "computing",
    level: query.level ?? "B1",
  });

  return NextResponse.json(snapshot);
}

export async function POST(request: NextRequest) {
  try {
    const payload = markMasteredSchema.parse(await request.json());
    const item = await markWritingLanguageItemMastered(payload);
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update writing language progress";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
