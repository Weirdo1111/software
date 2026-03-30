import { describe, expect, it } from "vitest";

import { roleplayConversationPrompt } from "@/lib/ai/prompts";

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
});
