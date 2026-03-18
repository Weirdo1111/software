import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { speakingFeedbackPrompt } from "@/lib/ai/prompts";

const schema = z.object({
  audio_url: z.string().url().optional(),
  transcript: z.string().min(1).optional(),
  prompt_id: z.string().optional(),
  target_level: z.enum(["A1", "A2", "B1", "B2"]),
});

function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const transcript = payload.transcript || "Learner submitted an audio response.";

    if (!hasAIConfig()) {
      return NextResponse.json({
        pronunciation_score: 7.2,
        fluency_score: 6.8,
        grammar_score: 7,
        tips: [
          "Slow down your sentence endings for clearer pronunciation.",
          "Use linking words like 'because' and 'however' for fluency.",
          "Check verb tense consistency in longer sentences.",
        ],
      });
    }

    const output = await generateStructuredJSON(speakingFeedbackPrompt(payload.target_level, transcript));
    const parsed = safeParseJSON(output, {
      pronunciation_score: 7,
      fluency_score: 7,
      grammar_score: 7,
      tips: ["Practice shadowing for 10 minutes daily."],
    });

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to generate speaking feedback", 500);
  }
}
