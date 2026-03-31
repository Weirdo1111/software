import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const attemptsSchema = z.object({
  exercise_id: z.string().min(1),
  answer_payload: z.record(z.string(), z.unknown()),
  duration_sec: z.number().int().min(1).max(1800),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = attemptsSchema.parse(body);

    const userId = await resolveRequestUserId(request);
    const answer = payload.answer_payload.answer;
    const expected = payload.answer_payload.correct_answer;
    const correctness = typeof answer !== "undefined" && typeof expected !== "undefined" ? answer === expected : true;

    const result = {
      correctness,
      explanation: correctness ? "Correct answer." : "Please review this knowledge point and retry.",
      next_action: correctness ? "continue" : "review",
    } as const;

    await prisma.userAttempt.create({
      data: {
        userId,
        exerciseId: payload.exercise_id,
        answerPayload: payload.answer_payload as Prisma.InputJsonValue,
        durationSec: payload.duration_sec,
        correctness,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to submit attempt", 500);
  }
}
