import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { hasNonEnglishContent } from "@/lib/ai/language";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { speakingPartnerPrompt } from "@/lib/ai/prompts";
import { buildMockSpeakingPartnerReply, safeParseAIJSON } from "@/lib/speaking-ai";
import { getSpeakingPromptById } from "@/lib/speaking-prompts";

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a text-based AI speaking partner so learners can rehearse academic turns before scoring.
const schema = z.object({
  prompt_id: z.string().min(1),
  target_level: z.enum(["low", "medium", "high"]),
  task_context: z.object({
    title: z.string().min(1),
    major_label: z.string().min(1),
    category_label: z.string().min(1),
    scenario: z.string().min(1),
    partner_role: z.string().min(1),
    partner_goal: z.string().min(1),
  }),
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

    if (
      payload.task_context.title !== speakingPrompt.title ||
      payload.task_context.major_label !== speakingPrompt.major_label ||
      payload.task_context.category_label !== speakingPrompt.category_label ||
      payload.task_context.scenario !== speakingPrompt.scenario ||
      payload.task_context.partner_role !== speakingPrompt.partner_role ||
      payload.task_context.partner_goal !== speakingPrompt.partner_goal
    ) {
      return jsonError("Speaking task context is out of sync", 422);
    }

    const fallback = buildMockSpeakingPartnerReply(payload.learner_turn, speakingPrompt);

    if (!hasAIConfig()) {
      return NextResponse.json(fallback);
    }

    const output = await generateStructuredJSON(
      speakingPartnerPrompt(payload.target_level, speakingPrompt, payload.learner_turn, payload.history),
    );
    const parsed = safeParseAIJSON(output, fallback);

    return NextResponse.json(hasNonEnglishContent(parsed) ? fallback : parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to continue speaking practice", 500);
  }
}
