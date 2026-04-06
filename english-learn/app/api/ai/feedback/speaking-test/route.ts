import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { speakingTestFeedbackPrompt } from "@/lib/ai/prompts";
import { safeParseAIJSON } from "@/lib/speaking-ai";
import {
  buildMockSpeakingTestFeedback,
  getSpeakingTestQuestionSetById,
  normalizeSpeakingTestFeedback,
} from "@/lib/speaking-test";

const schema = z.object({
  set_id: z.string().min(1),
  answers: z
    .array(
      z.object({
        question_id: z.string().min(1),
        prompt: z.string().min(1),
        transcript: z.string().min(1),
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

    const fallback = normalizeSpeakingTestFeedback(buildMockSpeakingTestFeedback(questionSet, payload.answers));

    if (!hasAIConfig()) {
      return NextResponse.json(fallback);
    }

    const output = await generateStructuredJSON(speakingTestFeedbackPrompt(questionSet, payload.answers));
    const parsed = safeParseAIJSON(output, fallback);

    return NextResponse.json(normalizeSpeakingTestFeedback(parsed));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to generate speaking test feedback", 500);
  }
}
