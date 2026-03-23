import OpenAI from "openai";
import { existsSync, readFileSync } from "fs";
import path from "path";

import { env } from "@/lib/env";

const DEFAULT_MODEL = "gpt-4o-mini";
const ZHIPU_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/";
const ZHIPU_DEFAULT_MODEL = "glm-4-flash";
const ROOT_API_KEY_PATH = path.resolve(process.cwd(), "..", "API_key");

/** Detect ZhiPu (智谱) API keys by their characteristic format: hex.Base64 */
function isZhipuKey(key: string) {
  return /^[0-9a-f]{32}\.\w+$/i.test(key);
}

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
  let fileApiKey = "";

  try {
    if (existsSync(ROOT_API_KEY_PATH)) {
      fileApiKey = readFileSync(ROOT_API_KEY_PATH, "utf8").trim();
    }
  } catch {
    fileApiKey = "";
  }

  const apiKey = env.server.AI_API_KEY || env.server.OPENAI_API_KEY || fileApiKey;
  const explicitBaseURL = env.server.AI_BASE_URL || undefined;
  const explicitModel = env.server.AI_MODEL || undefined;

  // Auto-detect ZhiPu keys and apply defaults when no explicit config is set
  const useZhipu = apiKey && isZhipuKey(apiKey) && !explicitBaseURL;

  return {
    apiKey,
    baseURL: explicitBaseURL || (useZhipu ? ZHIPU_BASE_URL : undefined),
    model: explicitModel || (useZhipu ? ZHIPU_DEFAULT_MODEL : DEFAULT_MODEL),
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
