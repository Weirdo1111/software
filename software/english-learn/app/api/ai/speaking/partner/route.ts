import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { speakingPartnerPrompt } from "@/lib/ai/prompts";
import { buildMockSpeakingPartnerReply, safeParseAIJSON } from "@/lib/speaking-ai";
import { getSpeakingPromptById } from "@/lib/speaking-prompts";

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a text-based AI speaking partner so learners can rehearse academic turns before scoring.
const schema = z.object({
  prompt_id: z.string().min(1),
  target_level: z.enum(["A1", "A2", "B1", "B2"]),
  learner_turn: z.string().min(3),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .max(8)
    .default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const speakingPrompt = getSpeakingPromptById(payload.prompt_id);
    if (!speakingPrompt) {
      return jsonError("Invalid speaking prompt", 422);
    }

    if (!hasAIConfig()) {
      return NextResponse.json(buildMockSpeakingPartnerReply(payload.learner_turn));
    }

    const output = await generateStructuredJSON(
      speakingPartnerPrompt(payload.target_level, speakingPrompt, payload.learner_turn, payload.history),
    );
    const parsed = safeParseAIJSON(output, {
      reply: "Your point is understandable. Build it further with one clearer support detail.",
      follow_up: "Can you give one concrete example to support that idea?",
      coaching_note: "Keep the next turn short and focused on one claim.",
    });

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to continue speaking practice", 500);
  }
}
