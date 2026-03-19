import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { speakingFeedbackPrompt } from "@/lib/ai/prompts";
import { buildMockSpeakingFeedback, safeParseAIJSON } from "@/lib/speaking-ai";
import { getSpeakingPromptById } from "@/lib/speaking-prompts";

// Date: 2026/3/18
// Author: Tianbo Cao
// Upgraded the speaking feedback route so scoring is linked to a selected academic prompt.

const schema = z.object({
  audio_url: z.string().url().optional(),
  transcript: z.string().min(1).optional(),
  prompt_id: z.string().min(1),
  target_level: z.enum(["A1", "A2", "B1", "B2"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const speakingPrompt = getSpeakingPromptById(payload.prompt_id);
    if (!speakingPrompt) {
      return jsonError("Invalid speaking prompt", 422);
    }

    const transcript = payload.transcript || "Learner submitted an audio response.";

    if (!hasAIConfig()) {
      return NextResponse.json(buildMockSpeakingFeedback(transcript, speakingPrompt.checkpoints));
    }

    const output = await generateStructuredJSON(speakingFeedbackPrompt(payload.target_level, speakingPrompt, transcript));
    const parsed = safeParseAIJSON(output, {
      overall_score: 7,
      task_response_score: 7,
      pronunciation_score: 7,
      fluency_score: 7,
      grammar_score: 7,
      strengths: ["Your answer is understandable.", "Your main point is visible."],
      revision_focus: "Add one clearer example and tighten your sentence structure in the next attempt.",
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
