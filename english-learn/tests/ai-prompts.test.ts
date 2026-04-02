import { describe, expect, it } from "vitest";

import { buddyNavigatorPrompt, roleplayConversationPrompt } from "@/lib/ai/prompts";

describe("AI prompt helpers", () => {
  it("builds a roleplay conversation prompt with JSON instructions and history", () => {
    const prompt = roleplayConversationPrompt("I think we should check the library door first.", [
      { role: "assistant", content: "Interesting. What makes that door stand out?" },
      { role: "user", content: "There was a strange sound near it a minute ago." },
    ]);

    expect(prompt).toContain("Return strict JSON with keys: reply, follow_up, coaching_note.");
    expect(prompt).toContain("Character: Interesting. What makes that door stand out?");
    expect(prompt).toContain("User: There was a strange sound near it a minute ago.");
    expect(prompt).toContain("Learner's latest turn:");
  });

  it("builds a buddy navigator prompt that stays within site knowledge", () => {
    const prompt = buddyNavigatorPrompt({
      locale: "en",
      query: "Where can I find reading feedback?",
      pathname: "/reading",
      currentPageText: "Reading | Complete reading practice and AI feedback.",
      siteMapText: "- reading: Reading | Complete reading practice and AI feedback.",
      faqText: "- start-reading: where is reading feedback -> Open the Reading page.",
    });

    expect(prompt).toContain("Only answer questions about this website's pages, functions, and usage flow.");
    expect(prompt).toContain("Return strict JSON with keys:");
    expect(prompt).toContain("Current page:");
    expect(prompt).toContain("Site map:");
    expect(prompt).toContain("FAQ hints:");
  });
});
