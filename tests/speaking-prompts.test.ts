import { describe, expect, it } from "vitest";

import { getSpeakingPromptById, getSpeakingPromptsForLevel } from "@/lib/speaking-prompts";

describe("speaking prompts", () => {
  it("returns only prompts that match the selected CEFR level", () => {
    const prompts = getSpeakingPromptsForLevel("B1");

    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((prompt) => prompt.level === "B1")).toBe(true);
  });

  it("looks up a prompt by id", () => {
    const prompt = getSpeakingPromptById("b2-policy-debate");

    expect(prompt?.title).toBe("Attendance policy debate");
    expect(prompt?.partner_role).toBe("debate opponent");
  });
});
