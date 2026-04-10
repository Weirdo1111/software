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

type DoubaoSpeechConfig = {
  appId: string;
  accessKey: string;
  appKey: string;
  resourceId: string;
};

function getFirstEnvValue(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function getDoubaoSpeechConfig(): DoubaoSpeechConfig | null {
  const explicitAppId = env.server.DOUBAO_SPEECH_APP_ID.trim();
  const explicitAccessKey = env.server.DOUBAO_SPEECH_ACCESS_TOKEN.trim();
  const explicitResourceId = env.server.DOUBAO_SPEECH_RESOURCE_ID.trim();
  const explicitAppKey = getFirstEnvValue(["DOUBAO_SPEECH_APP_KEY"]);

  if (explicitAppId && explicitAccessKey) {
    return {
      appId: explicitAppId,
      accessKey: explicitAccessKey,
      appKey: explicitAppKey,
      resourceId: explicitResourceId || DEFAULT_RESOURCE_ID,
    };
  }

  const appId = getFirstEnvValue([
    "ROLEPLAY_DIALOG_SC_APP_ID",
    "ROLEPLAY_SC_APP_ID",
    "ROLEPLAY_DIALOG_APP_ID",
  ]);
  const accessKey = getFirstEnvValue([
    "ROLEPLAY_DIALOG_SC_ACCESS_KEY",
    "ROLEPLAY_SC_ACCESS_KEY",
    "ROLEPLAY_DIALOG_ACCESS_KEY",
  ]);
  const appKey = getFirstEnvValue([
    "ROLEPLAY_DIALOG_SC_APP_KEY",
    "ROLEPLAY_SC_APP_KEY",
    "ROLEPLAY_DIALOG_APP_KEY",
  ]);
  const resourceId =
    getFirstEnvValue([
      "DOUBAO_SPEECH_RESOURCE_ID",
      "ROLEPLAY_DIALOG_SC_ASR_RESOURCE_ID",
      "ROLEPLAY_SC_ASR_RESOURCE_ID",
      "ROLEPLAY_DIALOG_ASR_RESOURCE_ID",
    ]) || DEFAULT_RESOURCE_ID;

  if (!appId || !accessKey) {
    return null;
  }

  return {
    appId,
    accessKey,
    appKey,
    resourceId,
  };
}

// Date: 2026/3/18
// Author: Tianbo Cao
// Wraps Doubao speech recognition so speaking routes can stay focused on request validation and response shaping.
export function hasDoubaoSpeechConfig() {
  return Boolean(getDoubaoSpeechConfig());
}

export async function transcribeDoubaoSpeech(audioBase64: string) {
  const config = getDoubaoSpeechConfig();

  if (!config) {
    throw new Error(
      "Speech transcription is not configured. Add DOUBAO_SPEECH_APP_ID and DOUBAO_SPEECH_ACCESS_TOKEN, or configure ROLEPLAY_DIALOG_* credentials.",
    );
  }

  const response = await fetch(DOUBAO_ASR_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.appKey ? { "X-Api-App-Key": config.appKey } : {}),
      "X-Api-Access-Key": config.accessKey,
      "X-Api-Resource-Id": config.resourceId,
      "X-Api-Request-Id": randomUUID(),
      "X-Api-Sequence": "-1",
    },
    body: JSON.stringify({
      user: {
        uid: config.appId,
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
    provider: "doubao-speech",
  };
}
