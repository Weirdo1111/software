import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { speakingPartnerPrompt } from "@/lib/ai/prompts";
import { buildMockSpeakingPartnerReply, safeParseAIJSON } from "@/lib/speaking-ai";

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a text-based AI speaking partner so learners can rehearse academic turns before scoring.
const schema = z.object({
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

    if (!hasAIConfig()) {
      return NextResponse.json(buildMockSpeakingPartnerReply(payload.learner_turn));
    }

    const output = await generateStructuredJSON(speakingPartnerPrompt(payload.learner_turn, payload.history));
    const parsed = safeParseAIJSON(output, {
      reply: "I understand what you mean. Tell me a little more about that.",
      follow_up: "What makes you feel that way?",
      coaching_note: "Keep the next turn natural and add one specific detail.",
    });

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to continue speaking practice", 500);
  }
}
