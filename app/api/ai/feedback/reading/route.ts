import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { readingFeedbackPrompt } from "@/lib/ai/prompts";

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

const mockFeedback: Record<string, object> = {
  A1: {
    comprehension_score: 7.1,
    claim_feedback:
      "Good effort. You identified the main point about regular library visits helping students build stronger study habits.",
    evidence_feedback:
      "You found a useful detail from the survey. Try to explain more clearly how weekly library visits connect to finishing reading tasks before the deadline.",
    vocabulary_feedback:
      "These are useful early academic words for campus study. Practice using library, deadline, and study habit in your own sentences.",
    tips: [
      "The main claim is the broad idea the writer wants you to remember after reading.",
      "Evidence is a specific fact, number, or example that supports the main claim, not just background information.",
      "Words like 'However' often signal a contrast between two study habits or results.",
    ],
  },
  A2: {
    comprehension_score: 7.5,
    claim_feedback:
      "You identified the central point about attendance and its effect on understanding course material.",
    evidence_feedback:
      "Good. The percentage comparison between attending and non-attending students is the key supporting detail.",
    vocabulary_feedback:
      "Your selections are useful early academic terms that appear across many university subjects.",
    tips: [
      "When locating a main claim, look for the sentence that makes the broadest assertion.",
      "Distinguish evidence from background by asking: does this detail prove the claim, or only set the scene?",
      "Transition words like 'However' signal that the argument is shifting direction.",
    ],
  },
  B1: {
    comprehension_score: 7.5,
    claim_feedback:
      "You correctly identified the central claim about reading frequency and comprehension depth under remote conditions.",
    evidence_feedback:
      "Good. The longitudinal survey data is the key piece of evidence that directly supports the claim.",
    vocabulary_feedback:
      "Your selections are well-chosen; both terms appear frequently in academic texts on learning environments.",
    tips: [
      "When locating a main claim, look for a sentence that makes a direct assertion about cause or contrast.",
      "Distinguish evidence from background by asking: does this detail prove the claim, or only set the scene?",
      "Transition words like 'However' are reliable signals that the argument is shifting direction.",
    ],
  },
  B2: {
    comprehension_score: 8.0,
    claim_feedback:
      "You accurately pinpointed the claim about disciplinary exposure and analytical reading development.",
    evidence_feedback:
      "Strong identification. The meta-analysis statistic on methodological limitation detection is the most direct evidence.",
    vocabulary_feedback:
      "Your selections demonstrate awareness of research methodology vocabulary, which is essential at postgraduate level.",
    tips: [
      "In dense academic texts, the claim is often embedded mid-paragraph after contextualising evidence.",
      "A meta-analysis synthesises multiple studies; always check what claim the synthesis is being used to support.",
      "Contrast signals like 'However' carry particular weight when they follow a concession to the opposing view.",
    ],
  },
};

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
      return NextResponse.json(mockFeedback[payload.target_level] ?? mockFeedback.B1);
    }

    const output = await generateStructuredJSON(
      readingFeedbackPrompt(payload.target_level, payload.passage, payload.answers),
    );
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
