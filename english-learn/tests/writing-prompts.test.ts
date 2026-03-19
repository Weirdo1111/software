import { describe, expect, it } from "vitest";

import { getWritingPromptById, getWritingPromptsForLevel } from "@/lib/writing-prompts";

describe("writing prompts", () => {
  it("returns only prompts that match the selected CEFR level", () => {
    const prompts = getWritingPromptsForLevel("B1");

    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((prompt) => prompt.level === "B1")).toBe(true);
  });

  it("looks up a prompt by id", () => {
    const prompt = getWritingPromptById("b2-attendance-policy-argument");

    expect(prompt?.title).toBe("Attendance policy argument");
    expect(prompt?.scenario).toContain("faculty");
  });

  it("keeps multiple prompt options available for every CEFR level", () => {
    expect(getWritingPromptsForLevel("A1").length).toBeGreaterThanOrEqual(4);
    expect(getWritingPromptsForLevel("A2").length).toBeGreaterThanOrEqual(4);
    expect(getWritingPromptsForLevel("B1").length).toBeGreaterThanOrEqual(4);
    expect(getWritingPromptsForLevel("B2").length).toBeGreaterThanOrEqual(4);
  });
});
