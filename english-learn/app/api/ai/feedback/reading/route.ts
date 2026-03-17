import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { readingFeedbackPrompt } from "@/lib/ai/prompts";
import { env } from "@/lib/env";

const schema = z.object({
  passage: z.string().min(50),
  answers: z.object({
    claim: z.string().min(1),
    evidence: z.string().min(1),
    contrast_signal: z.string().min(1),
    vocabulary: z.array(z.string()).max(5).default([]),
  }),
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

    if (!env.server.OPENAI_API_KEY) {
      return NextResponse.json({
        comprehension_score: 7.5,
        claim_feedback:
          "You correctly identified the central claim about reading frequency and comprehension depth under remote conditions.",
        evidence_feedback:
          "Good — the longitudinal survey data is the key piece of evidence that directly supports the claim.",
        vocabulary_feedback:
          "Your selections are well-chosen; both terms appear frequently in academic texts on learning environments.",
        tips: [
          "When locating a main claim, look for a sentence that makes a direct assertion about cause or contrast.",
          "Distinguish evidence from background by asking: does this detail prove the claim, or only set the scene?",
          "Transition words like 'However' are reliable signals that the argument is shifting direction.",
        ],
      });
    }

    const openai = new OpenAI({ apiKey: env.server.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: readingFeedbackPrompt(payload.target_level, payload.passage, payload.answers),
    });

    const output = response.output_text || "";
    const parsed = safeParseJSON(output, {
      comprehension_score: 7,
      claim_feedback: "Review the passage again and look for the sentence that makes the broadest assertion.",
      evidence_feedback: "Try to identify a specific detail that directly proves the claim rather than introduces it.",
      vocabulary_feedback: "Consider selecting terms that appear in multiple sentences across the passage.",
      tips: ["Re-read the passage focusing on how each paragraph relates to the central claim."],
    });

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to generate reading feedback", 500);
  }
}
