import { describe, expect, it } from "vitest";

import {
  buildBuddyGuideAction,
  getBuddyCurrentPageGuide,
  resolveBuddyGuideRule,
} from "@/lib/buddy-site-guide";

describe("buddy site guide", () => {
  it("routes reading feedback questions to the reading page", () => {
    const result = resolveBuddyGuideRule({
      locale: "zh",
      query: "阅读批改在哪里",
      pathname: "/schedule",
      levelPrefix: "B1",
    });

    expect(result.mode).toBe("faq");
    expect(result.answer).toContain("Reading 页面");
    expect(result.actions[0]).toMatchObject({
      id: "reading",
      href: "/reading?lang=zh",
      requiresLogin: true,
    });
  });

  it("avoids duplicate actions when the user asks about the current page", () => {
    const result = resolveBuddyGuideRule({
      locale: "en",
      query: "How do I use this page",
      pathname: "/schedule",
      levelPrefix: "A2",
    });

    expect(result.mode).toBe("guide");
    expect(result.actions.map((action) => action.id)).toEqual(["schedule", "listening", "progress"]);
  });

  it("builds level-aware speaking actions", () => {
    expect(buildBuddyGuideAction("speaking", { locale: "en", levelPrefix: "B2" })).toMatchObject({
      id: "speaking",
      href: "/lesson/B2-speaking-starter?lang=en",
      requiresLogin: true,
    });
  });

  it("shows related shortcuts for the current reading page", () => {
    const guide = getBuddyCurrentPageGuide("zh", "/reading", "A2");

    expect(guide.answer).toContain("阅读页面");
    expect(guide.actions.map((action) => action.id)).toEqual(["reading", "review", "schedule"]);
  });
});
