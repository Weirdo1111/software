import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { speakingTestFeedbackPrompt } from "@/lib/ai/prompts";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { safeParseAIJSON } from "@/lib/speaking-ai";
import {
  buildMissingTranscriptSpeakingTestFeedback,
  buildMockSpeakingTestFeedback,
  getSpeakingTestQuestionSetById,
  normalizeSpeakingTestFeedback,
} from "@/lib/speaking-test";
import type { SpeakingEvaluationStoredInput } from "@/lib/speaking-evaluation-history";

const schema = z.object({
  set_id: z.string().min(1),
  answers: z
    .array(
      z.object({
        question_id: z.string().min(1),
        prompt: z.string().min(1),
        transcript: z.string(),
        duration_sec: z.number().positive(),
      }),
    )
    .length(3),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const questionSet = getSpeakingTestQuestionSetById(payload.set_id);

    if (!questionSet) {
      return jsonError("Invalid speaking test set.", 422);
    }

    const promptsMatch = payload.answers.every((answer, index) => {
      const question = questionSet.questions[index];
      return Boolean(question) && question.id === answer.question_id && question.prompt === answer.prompt;
    });

    if (!promptsMatch) {
      return jsonError("Speaking test questions are out of sync.", 422);
    }

    const hasCompleteTranscripts = payload.answers.every((answer) => answer.transcript.trim().length > 0);
    const mockFeedback = normalizeSpeakingTestFeedback(buildMockSpeakingTestFeedback(questionSet, payload.answers));

    const result = !hasCompleteTranscripts
      ? normalizeSpeakingTestFeedback(buildMissingTranscriptSpeakingTestFeedback(questionSet, payload.answers))
      : !hasAIConfig()
        ? mockFeedback
        : normalizeSpeakingTestFeedback(
            safeParseAIJSON(
              await generateStructuredJSON(speakingTestFeedbackPrompt(questionSet, payload.answers)),
              mockFeedback,
            ),
          );

    await persistSpeakingTestFeedback({
      input: {
        set_id: questionSet.id,
        set_title: questionSet.title,
        set_theme: questionSet.theme,
        answers: payload.answers,
      },
      output: result,
    }).catch((persistError) => {
      console.error("Speaking-test feedback persistence failed:", persistError);
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to generate speaking test feedback", 500);
  }
}

async function persistSpeakingTestFeedback({
  input,
  output,
}: {
  input: SpeakingEvaluationStoredInput;
  output: ReturnType<typeof normalizeSpeakingTestFeedback>;
}) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return;
  }

  const durationSec = Math.max(
    1,
    input.answers.reduce((sum, answer) => sum + Math.max(1, Math.round(answer.duration_sec)), 0),
  );
  const attemptId = crypto.randomUUID();
  const feedbackId = crypto.randomUUID();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO user_attempts (id, userId, exerciseId, answerPayload, durationSec, correctness, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    attemptId,
    user.id.toString(),
    `speaking-test:${input.set_id}`,
    JSON.stringify(input),
    durationSec,
    output.overall_score >= 60 ? 1 : 0,
  );

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ai_feedback_records (id, userAttemptId, userId, feedbackType, inputPayload, outputPayload, tokenCost, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NOW())
    `,
    feedbackId,
    attemptId,
    user.id.toString(),
    "speaking-test-report",
    JSON.stringify(input),
    JSON.stringify(output),
  );
}
