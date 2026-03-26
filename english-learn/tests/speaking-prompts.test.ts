import { describe, expect, it } from "vitest";

import { getSpeakingPromptById, getSpeakingPromptsForLevel } from "@/lib/speaking-prompts";

describe("speaking prompts", () => {
  it("maps CEFR access to prompts in the matching difficulty band", () => {
    const prompts = getSpeakingPromptsForLevel("B1");

    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((prompt) => prompt.difficulty === "medium")).toBe(true);
  });

  it("looks up a prompt by id", () => {
    const prompt = getSpeakingPromptById("transport-high-mobility-policy");

    expect(prompt?.title).toBe("Respond to a mobility policy");
    expect(prompt?.partner_role).toBe("policy tutor");
  });
});
