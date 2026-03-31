import { NextResponse } from "next/server";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import { getPlacementQuestionSet } from "@/lib/placement";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const sessionId = crypto.randomUUID();
    const questions = getPlacementQuestionSet().map((question) => ({
      id: question.id,
      type: question.type,
      skill: question.skill,
      level: question.level,
      context: question.context,
      prompt: question.prompt,
      options: question.options,
    }));

    await prisma.placementSession.create({
      data: {
        id: sessionId,
        userId: await resolveRequestUserId(request),
      },
    });

    return NextResponse.json({
      test_session_id: sessionId,
      questions,
    });
  } catch {
    return jsonError("Failed to start placement test", 500);
  }
}
