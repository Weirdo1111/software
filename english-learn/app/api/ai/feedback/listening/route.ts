import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { listeningFeedbackPrompt } from "@/lib/ai/prompts";

const schema = z.object({
  talk_title: z.string().min(1),
  speaker_name: z.string().min(1),
  scenario: z.string().min(1),
  answers: z.object({
    gist: z.string().min(1),
    detail: z.string().min(1),
    signpost: z.string().min(1),
    term: z.string().min(1),
  }),
  notes: z.string().default(""),
  target_level: z.enum(["A1", "A2", "B1", "B2"]),
});

const mockFeedback: Record<string, object> = {
  A1: {
    listening_score: 7.0,
    gist_feedback:
      "Good effort. You captured the general topic of the talk and identified the speaker's main point.",
    detail_feedback:
      "You found a relevant detail. Try to be more specific about the exact example or number the speaker used.",
    signpost_feedback:
      "You identified a useful structural element. Keep listening for how speakers connect their main sections.",
    term_feedback:
      "Good choice. Practice using this term in your own sentences to make it easier to recall.",
    note_feedback:
      "Your notes show you were actively listening. Try to include at least one specific detail next time.",
    tips: [
      "Focus on the speaker's opening and closing sentences — they usually contain the main message.",
      "When you hear a number or name, write it down immediately in your notes.",
      "Replay difficult sections at a slower speed before answering.",
    ],
  },
  A2: {
    listening_score: 7.2,
    gist_feedback:
      "You identified the central topic well. Try to include the speaker's purpose, not just the subject.",
    detail_feedback:
      "Good detail selection. The most useful details are the ones that directly prove the speaker's main claim.",
    signpost_feedback:
      "You noticed an important structural signal. This helps you follow longer academic talks more easily.",
    term_feedback:
      "This is a useful academic term for your field. Try to connect it to the speaker's argument.",
    note_feedback:
      "Your notes cover the basics. Adding one quote or specific example would strengthen them.",
    tips: [
      "Listen for the speaker's main claim in the first two minutes of the talk.",
      "Write down specific examples or data points — they are the strongest evidence.",
      "After watching, compare your notes with the talk's transcript to find what you missed.",
    ],
  },
  B1: {
    listening_score: 7.5,
    gist_feedback:
      "You correctly identified the main argument. Strong answers connect the topic to the speaker's purpose.",
    detail_feedback:
      "Good. The specific detail you chose supports the main claim. Try to explain why it matters.",
    signpost_feedback:
      "You identified a useful structural element that helps track the speaker's argument.",
    term_feedback:
      "Good selection. This term appears in academic writing across your discipline.",
    note_feedback:
      "Your notes show active engagement. Including both a claim and a supporting detail makes them more useful for review.",
    tips: [
      "Strong listeners connect the main claim to the evidence rather than listing facts separately.",
      "Technical terms are easier to remember when you write both the term and a short definition.",
      "Try summarising the talk in two sentences after watching — this tests real comprehension.",
    ],
  },
  B2: {
    listening_score: 8.0,
    gist_feedback:
      "You accurately captured the speaker's argument and its broader significance.",
    detail_feedback:
      "Strong identification. You chose a detail that directly supports the central claim.",
    signpost_feedback:
      "You identified an important structural signal that helps organise the argument.",
    term_feedback:
      "Excellent choice. This is a field-specific term that strengthens your academic vocabulary.",
    note_feedback:
      "Your notes are well-structured and include both claims and evidence. This is strong note-taking practice.",
    tips: [
      "At B2 level, focus on how speakers build arguments across multiple examples, not just individual points.",
      "Compare your notes with the official transcript to identify vocabulary you missed.",
      "Practice explaining the talk's argument to someone else — this deepens comprehension.",
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
      listeningFeedbackPrompt(
        payload.target_level,
        payload.talk_title,
        payload.speaker_name,
        payload.scenario,
        payload.answers,
        payload.notes,
      ),
    );
    const parsed = safeParseJSON(output, {
      listening_score: 7,
      gist_feedback: "Review the talk and focus on the speaker's main argument.",
      detail_feedback: "Try to identify a specific detail that directly supports the claim.",
      signpost_feedback: "Listen for how the speaker structures their argument.",
      term_feedback: "Choose a technical term that you can reuse in academic discussion.",
      note_feedback: "Try to include both claims and evidence in your notes.",
      tips: ["Re-watch the talk focusing on how each section connects to the main message."],
    });

    // Normalize tips to always be an array (AI sometimes returns a string)
    if (typeof parsed.tips === "string") {
      parsed.tips = (parsed.tips as string).split(/[,，]/).map((t: string) => t.trim()).filter(Boolean);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to generate listening feedback", 500);
  }
}
