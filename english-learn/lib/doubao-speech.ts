import { randomUUID } from "node:crypto";

import { env } from "@/lib/env";

const DEFAULT_RESOURCE_ID = "volc.bigasr.auc_turbo";
const DOUBAO_ASR_URL = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash";

type DoubaoSpeechResult = {
  result?: {
    text?: string;
    utterances?: Array<{
      text?: string;
      start_time?: number;
      end_time?: number;
    }>;
  };
  audio_info?: {
    duration?: number;
  };
};

// Date: 2026/3/18
// Author: Tianbo Cao
// Wraps Doubao speech recognition so speaking routes can stay focused on request validation and response shaping.
export function hasDoubaoSpeechConfig() {
  return Boolean(env.server.DOUBAO_SPEECH_APP_ID && env.server.DOUBAO_SPEECH_ACCESS_TOKEN);
}

export async function transcribeDoubaoSpeech(audioBase64: string) {
  const appId = env.server.DOUBAO_SPEECH_APP_ID;
  const accessToken = env.server.DOUBAO_SPEECH_ACCESS_TOKEN;
  const resourceId = env.server.DOUBAO_SPEECH_RESOURCE_ID || DEFAULT_RESOURCE_ID;

  if (!appId || !accessToken) {
    throw new Error("Speech transcription is not configured. Add DOUBAO_SPEECH_APP_ID and DOUBAO_SPEECH_ACCESS_TOKEN.");
  }

  const response = await fetch(DOUBAO_ASR_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-App-Key": appId,
      "X-Api-Access-Key": accessToken,
      "X-Api-Resource-Id": resourceId,
      "X-Api-Request-Id": randomUUID(),
      "X-Api-Sequence": "-1",
    },
    body: JSON.stringify({
      user: {
        uid: appId,
      },
      audio: {
        data: audioBase64,
      },
      request: {
        model_name: "bigmodel",
      },
    }),
  });

  const statusCode = response.headers.get("X-Api-Status-Code");
  const statusMessage = response.headers.get("X-Api-Message");
  const payload = (await response.json().catch(() => null)) as DoubaoSpeechResult | null;

  if (!response.ok || (statusCode && statusCode !== "20000000")) {
    throw new Error(statusMessage || "Doubao speech recognition failed.");
  }

  const transcript = payload?.result?.text?.trim() ?? "";
  if (!transcript) {
    throw new Error("Doubao speech recognition returned an empty transcript.");
  }

  return {
    transcript,
    utterances:
      payload?.result?.utterances?.map((utterance) => ({
        text: utterance.text ?? "",
        start_time_ms: utterance.start_time ?? 0,
        end_time_ms: utterance.end_time ?? 0,
      })) ?? [],
    duration_ms: payload?.audio_info?.duration ?? 0,
  };
}
