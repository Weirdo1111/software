import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { writingFeedbackPrompt } from "@/lib/ai/prompts";

const schema = z.object({
  essay_text: z.string().min(10),
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

    if (!hasAIConfig()) {
      return NextResponse.json({
        overall_score: 7.1,
        errors: ["Use third-person singular: 'saves'", "Use 'at home' instead of 'in home'"],
        rewrite_sample: "I think remote work is useful because it saves time and helps people focus better at home.",
      });
    }

    const output = await generateStructuredJSON(writingFeedbackPrompt(payload.target_level, payload.essay_text));
    const parsed = safeParseJSON(output, {
      overall_score: 7,
      errors: ["Grammar and tense inconsistency."],
      rewrite_sample: payload.essay_text,
    });

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to generate writing feedback", 500);
  }
}
