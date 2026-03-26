import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { getAIConfig, hasAIConfig } from "@/lib/ai/client";
import { hasDoubaoSpeechConfig, transcribeDoubaoSpeech } from "@/lib/doubao-speech";

const schema = z.object({
  audio_base64: z.string().min(20),
  mime_type: z.string().optional(),
  duration_ms: z.number().nonnegative().optional(),
});

const OPENAI_AUDIO_BASE_URL = "https://api.openai.com/v1/";

function normalizeBaseUrl(baseURL?: string) {
  return baseURL ? (baseURL.endsWith("/") ? baseURL : `${baseURL}/`) : OPENAI_AUDIO_BASE_URL;
}

function getTranscriptionModel(baseURL?: string) {
  if (baseURL?.includes("open.bigmodel.cn")) {
    return "glm-asr-2512";
  }

  return "gpt-4o-mini-transcribe";
}

function buildAudioFileName(mimeType?: string) {
  if (mimeType?.includes("mp3")) return "speaking-take.mp3";
  if (mimeType?.includes("ogg")) return "speaking-take.ogg";
  if (mimeType?.includes("webm")) return "speaking-take.webm";
  if (mimeType?.includes("mp4")) return "speaking-take.mp4";
  return "speaking-take.wav";
}

async function transcribeWithConfiguredAI(audioBase64: string, mimeType?: string) {
  const { apiKey, baseURL } = getAIConfig();
  if (!apiKey) {
    throw new Error("Speech transcription is not configured. Add AI_API_KEY or OPENAI_API_KEY.");
  }

  const endpoint = new URL("audio/transcriptions", normalizeBaseUrl(baseURL)).toString();
  const audioBytes = Buffer.from(audioBase64, "base64");
  const formData = new FormData();

  formData.append("model", getTranscriptionModel(baseURL));
  formData.append("stream", "false");
  formData.append("file", new Blob([audioBytes], { type: mimeType ?? "audio/wav" }), buildAudioFileName(mimeType));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as { text?: string; error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Configured speech transcription failed.");
  }

  const transcript = payload?.text?.trim() ?? "";
  if (!transcript) {
    throw new Error("Speech transcription returned an empty transcript.");
  }

  return {
    transcript,
    utterances: [],
    duration_ms: 0,
    provider: baseURL?.includes("open.bigmodel.cn") ? "zhipu-asr" : "openai-audio",
  };
}

// Date: 2026/3/18
// Author: Tianbo Cao
// Adds a dedicated speaking transcription route so recorded takes can be turned into draft text before scoring.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const transcription = hasAIConfig()
      ? await transcribeWithConfiguredAI(payload.audio_base64, payload.mime_type)
      : hasDoubaoSpeechConfig()
        ? await transcribeDoubaoSpeech(payload.audio_base64)
        : (() => {
            throw new Error("Speech transcription is not configured. This project now prefers AI_API_KEY and AI_BASE_URL from the main AI setup.");
          })();
    const provider = "provider" in transcription ? transcription.provider : "doubao-speech";

    return NextResponse.json({
      transcript: transcription.transcript,
      utterances: transcription.utterances,
      duration_ms: transcription.duration_ms || payload.duration_ms || 0,
      provider,
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
