import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestUserId, jsonError } from "@/lib/api";
import { calculateNextReview } from "@/lib/srs";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/* ── POST: create new cards ─────────────────────────────────────── */

const createSchema = z.object({
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
    const payload = createSchema.parse(body);
    const userId = getRequestUserId(request);

    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ saved: 0, persisted: false, message: "Database not configured." });
    }

    // Dedup: check which words already exist for this user
    const fronts = payload.words.map((w) => w.front.toLowerCase());
    const { data: existing } = await supabase
      .from("review_cards")
      .select("front")
      .eq("user_id", userId)
      .in("front", fronts);

    const existingSet = new Set((existing ?? []).map((r) => r.front.toLowerCase()));
    const newWords = payload.words.filter((w) => !existingSet.has(w.front.toLowerCase()));

    if (newWords.length === 0) {
      const skipped = payload.words.length;
      return NextResponse.json({
        saved: 0,
        skipped,
        persisted: true,
        message: `${skipped} card(s) already in your deck — no duplicates added.`,
      });
    }

    const rows = newWords.map((word) => ({
      user_id: userId,
      front: word.front,
      back: word.back,
      tag: word.tag ?? "general",
      stability: 2,
      difficulty: 5,
      due_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("review_cards").insert(rows);

    if (error) {
      return jsonError("Failed to save vocabulary cards", 500);
    }

    const skipped = payload.words.length - newWords.length;
    return NextResponse.json({
      saved: newWords.length,
      skipped,
      persisted: true,
      message: skipped > 0
        ? `${newWords.length} card(s) added, ${skipped} duplicate(s) skipped.`
        : `${newWords.length} card(s) added to review deck.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to save vocabulary cards", 500);
  }
}

/* ── GET: retrieve cards for current user ────────────────────────── */

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter"); // "due" | "all"
    const tag = url.searchParams.get("tag"); // e.g. "Reading"

    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      // Return mock cards when DB is not configured so the review page still works
      const filtered = tag ? mockCards.filter((c) => c.tag === tag) : mockCards;
      return NextResponse.json({
        cards: filtered,
        stats: { due: filtered.length, total: filtered.length, mature: 0, at_risk: 0 },
        review_history: [],
        persisted: false,
      });
    }

    let query = supabase
      .from("review_cards")
      .select("id, front, back, tag, stability, difficulty, due_at, last_reviewed_at, lapses, created_at")
      .eq("user_id", userId)
      .order("due_at", { ascending: true });

    if (filter === "due") {
      query = query.lte("due_at", new Date().toISOString());
    }

    if (tag) {
      query = query.eq("tag", tag);
    }

    const { data: cards, error } = await query;

    if (error) {
      return jsonError("Failed to load review cards", 500);
    }

    const now = new Date();
    const allCards = cards ?? [];
    const due = allCards.filter((c) => new Date(c.due_at) <= now).length;
    const mature = allCards.filter((c) => c.stability >= 10).length;
    const atRisk = allCards.filter((c) => c.lapses >= 3).length;

    // Fetch recent review history (last 10 entries)
    const { data: logs } = await supabase
      .from("review_logs")
      .select("id, card_id, rating, next_due_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Resolve card fronts for the logs
    const logCardIds = [...new Set((logs ?? []).map((l) => l.card_id))];
    const cardFrontMap: Record<string, string> = {};
    if (logCardIds.length > 0) {
      const { data: logCards } = await supabase
        .from("review_cards")
        .select("id, front, tag")
        .in("id", logCardIds);
      for (const c of logCards ?? []) {
        cardFrontMap[c.id] = c.front;
      }
    }

    const reviewHistory = (logs ?? []).map((l) => ({
      id: l.id,
      card_front: cardFrontMap[l.card_id] ?? "Unknown",
      rating: l.rating,
      reviewed_at: l.created_at,
    }));

    return NextResponse.json({
      cards: allCards,
      stats: { due, total: allCards.length, mature, at_risk: atRisk },
      review_history: reviewHistory,
      persisted: true,
    });
  } catch {
    return jsonError("Failed to load review cards", 500);
  }
}

/* ── PATCH: submit a review rating and apply SRS ─────────────────── */

const reviewSchema = z.object({
  card_id: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  stability: z.number().optional(),
  difficulty: z.number().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const payload = reviewSchema.parse(body);
    const userId = getRequestUserId(request);

    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      // Simulate SRS response for demo without DB using provided or default values
      const result = calculateNextReview({
        stability: payload.stability ?? 2,
        difficulty: payload.difficulty ?? 5,
        rating: payload.rating,
      });
      return NextResponse.json({ ...result, persisted: false });
    }

    // Fetch current card state
    const { data: card, error: fetchError } = await supabase
      .from("review_cards")
      .select("stability, difficulty, lapses")
      .eq("id", payload.card_id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !card) {
      return jsonError("Card not found", 404);
    }

    const result = calculateNextReview({
      stability: Number(card.stability),
      difficulty: Number(card.difficulty),
      rating: payload.rating,
    });

    const nextLapses = payload.rating <= 1 ? card.lapses + 1 : card.lapses;

    // Update the card
    const { error: updateError } = await supabase
      .from("review_cards")
      .update({
        stability: result.next_stability,
        difficulty: result.next_difficulty,
        due_at: result.next_due_at,
        last_reviewed_at: new Date().toISOString(),
        lapses: nextLapses,
      })
      .eq("id", payload.card_id)
      .eq("user_id", userId);

    if (updateError) {
      return jsonError("Failed to update card", 500);
    }

    // Write review log
    await supabase.from("review_logs").insert({
      card_id: payload.card_id,
      user_id: userId,
      rating: payload.rating,
      next_due_at: result.next_due_at,
    });

    return NextResponse.json({ ...result, persisted: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to submit review", 500);
  }
}

/* ── DELETE: remove a card ────────────────────────────────────── */

const deleteSchema = z.object({
  card_id: z.string().min(1),
});

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const payload = deleteSchema.parse(body);
    const userId = getRequestUserId(request);

    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ deleted: true, persisted: false });
    }

    const { error } = await supabase
      .from("review_cards")
      .delete()
      .eq("id", payload.card_id)
      .eq("user_id", userId);

    if (error) {
      return jsonError("Failed to delete card", 500);
    }

    return NextResponse.json({ deleted: true, persisted: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }
    return jsonError("Failed to delete card", 500);
  }
}

/* ── Mock data for no-DB demo ─────────────────────────────────── */

const mockCards = [
  {
    id: "mock-1",
    front: "synthesize evidence",
    back: "To combine findings from multiple sources into a single coherent argument.",
    tag: "Writing",
    stability: 2,
    difficulty: 5,
    due_at: new Date().toISOString(),
    last_reviewed_at: null,
    lapses: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-2",
    front: "counterargument",
    back: "A reason or set of reasons given in opposition to the main claim.",
    tag: "Reading",
    stability: 4,
    difficulty: 4.85,
    due_at: new Date().toISOString(),
    last_reviewed_at: null,
    lapses: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-3",
    front: "signpost phrase",
    back: "Language that indicates the structure or direction of a spoken or written text (e.g. 'firstly', 'in contrast').",
    tag: "Listening",
    stability: 6,
    difficulty: 3.5,
    due_at: new Date().toISOString(),
    last_reviewed_at: null,
    lapses: 0,
    created_at: new Date().toISOString(),
  },
];
