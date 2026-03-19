import OpenAI from "openai";

import { env } from "@/lib/env";

const DEFAULT_MODEL = "gpt-4o-mini";

function getMessageText(
  content:
    | string
    | Array<{
        type?: string;
        text?: string;
      }>
    | null
    | undefined,
) {
  if (typeof content === "string") return content;
  if (!content) return "";

  return content
    .map((part) => (part.type === "text" && typeof part.text === "string" ? part.text : ""))
    .join("");
}

export function getAIConfig() {
  return {
    apiKey: env.server.AI_API_KEY || env.server.OPENAI_API_KEY,
    baseURL: env.server.AI_BASE_URL || undefined,
    model: env.server.AI_MODEL || DEFAULT_MODEL,
  };
}

export function hasAIConfig() {
  return Boolean(getAIConfig().apiKey);
}

export function createAIClient() {
  const { apiKey, baseURL } = getAIConfig();
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

export async function generateStructuredJSON(prompt: string) {
  const client = createAIClient();
  if (!client) return "";

  const { model } = getAIConfig();
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "Return valid JSON only. Do not wrap the JSON in markdown fences.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  return getMessageText(response.choices[0]?.message?.content);
}
