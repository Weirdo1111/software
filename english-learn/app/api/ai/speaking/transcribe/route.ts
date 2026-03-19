import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { transcribeDoubaoSpeech } from "@/lib/doubao-speech";

const schema = z.object({
  audio_base64: z.string().min(20),
  mime_type: z.string().optional(),
  duration_ms: z.number().nonnegative().optional(),
});

// Date: 2026/3/18
// Author: Tianbo Cao
// Adds a dedicated speaking transcription route so recorded takes can be turned into draft text before scoring.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const transcription = await transcribeDoubaoSpeech(payload.audio_base64);

    return NextResponse.json({
      transcript: transcription.transcript,
      utterances: transcription.utterances,
      duration_ms: transcription.duration_ms || payload.duration_ms || 0,
      provider: "doubao-speech",
      mime_type: payload.mime_type ?? "audio/wav",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    const message = error instanceof Error ? error.message : "Failed to transcribe the speaking take.";
    return jsonError(message, 500);
  }
}
