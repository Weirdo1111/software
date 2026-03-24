import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestUserId, jsonError } from "@/lib/api";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const attemptsSchema = z.object({
  exercise_id: z.string().min(1),
  answer_payload: z.record(z.string(), z.unknown()),
  duration_sec: z.number().int().min(1).max(1800),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = attemptsSchema.parse(body);

    const userId = getRequestUserId(request);
    const answer = payload.answer_payload.answer;
    const expected = payload.answer_payload.correct_answer;
    const correctness = typeof answer !== "undefined" && typeof expected !== "undefined" ? answer === expected : true;

    const result = {
      correctness,
      explanation: correctness ? "Correct answer." : "Please review this knowledge point and retry.",
      next_action: correctness ? "continue" : "review",
    } as const;

    const supabase = createSupabaseServiceClient();
    if (supabase) {
      await supabase.from("user_attempts").insert({
        user_id: userId,
        exercise_id: payload.exercise_id,
        answer_payload: payload.answer_payload,
        duration_sec: payload.duration_sec,
        correctness,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to submit attempt", 500);
  }
}
