import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestUserId, jsonError } from "@/lib/api";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  words: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        tag: z.string().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const userId = getRequestUserId(request);

    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ saved: 0, persisted: false, message: "Database not configured." });
    }

    const rows = payload.words.map((word) => ({
      user_id: userId,
      front: word.front,
      back: word.back,
      stability: 2,
      difficulty: 5,
      due_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("review_cards").insert(rows);

    if (error) {
      return jsonError("Failed to save vocabulary cards", 500);
    }

    return NextResponse.json({
      saved: payload.words.length,
      persisted: true,
      message: `${payload.words.length} card(s) added to review deck.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to save vocabulary cards", 500);
  }
}
