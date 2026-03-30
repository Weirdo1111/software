import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { roleplayConversationPrompt } from "@/lib/ai/prompts";
import { buildMockRoleplayReply } from "@/lib/roleplay";
import { safeParseAIJSON } from "@/lib/speaking-ai";

const schema = z.object({
  user_turn: z.string().min(2),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .max(12)
    .default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    if (!hasAIConfig()) {
      return NextResponse.json(buildMockRoleplayReply(payload.user_turn));
    }

    const output = await generateStructuredJSON(
      roleplayConversationPrompt(payload.user_turn, payload.history),
    );
    const parsed = safeParseAIJSON(output, buildMockRoleplayReply(payload.user_turn));

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to continue roleplay conversation", 500);
  }
}
