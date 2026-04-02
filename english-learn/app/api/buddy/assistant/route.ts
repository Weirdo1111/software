import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { generateStructuredJSON, hasAIConfig } from "@/lib/ai/client";
import { buddyNavigatorPrompt } from "@/lib/ai/prompts";
import {
  buildBuddyGuideAction,
  getBuddyGuidePromptContext,
  resolveBuddyGuideRule,
  type BuddyGuidePageId,
} from "@/lib/buddy-site-guide";

const schema = z.object({
  query: z.string().trim().max(240).default(""),
  locale: z.enum(["zh", "en"]).default("en"),
  pathname: z.string().trim().optional(),
  levelPrefix: z.string().trim().optional(),
});

const validPageIds: BuddyGuidePageId[] = [
  "home",
  "schedule",
  "listening",
  "listening-test",
  "reading",
  "speaking",
  "writing",
  "review",
  "discussion",
  "progress",
  "games",
  "sign-in",
];

function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function normalizePageIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item).trim() as BuddyGuidePageId)
    .filter((item, index, list): item is BuddyGuidePageId => validPageIds.includes(item) && list.indexOf(item) === index);
}

function normalizeQuickReplies(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 3);
}

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const rule = resolveBuddyGuideRule(payload);

    if (!payload.query || rule.confidence >= 0.72 || !hasAIConfig()) {
      return NextResponse.json(rule);
    }

    const promptContext = getBuddyGuidePromptContext(payload.locale, payload.pathname, payload.levelPrefix);
    const output = await generateStructuredJSON(
      buddyNavigatorPrompt({
        locale: payload.locale,
        query: payload.query,
        pathname: payload.pathname,
        siteMapText: promptContext.siteMapText,
        faqText: promptContext.faqText,
        currentPageText: promptContext.currentPageText,
      }),
    );

    const parsed = safeParseJSON(output, {
      answer: rule.answer,
      suggested_page_ids: rule.actions.map((action) => action.id),
      quick_replies: rule.quickReplies,
    });

    const suggestedPageIds = normalizePageIds((parsed as { suggested_page_ids?: unknown }).suggested_page_ids);
    const quickReplies = normalizeQuickReplies((parsed as { quick_replies?: unknown }).quick_replies);
    const answer = String((parsed as { answer?: unknown }).answer ?? "").trim() || rule.answer;

    return NextResponse.json({
      mode: "ai",
      answer,
      actions:
        (suggestedPageIds.length > 0 ? suggestedPageIds : rule.actions.map((action) => action.id))
          .slice(0, 3)
          .map((pageId) => buildBuddyGuideAction(pageId, payload)),
      quickReplies: quickReplies.length > 0 ? quickReplies : rule.quickReplies,
      confidence: Math.max(rule.confidence, 0.78),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to generate buddy assistant reply", 500);
  }
}
