import { describe, expect, it } from "vitest";

import {
  getSpeakingPromptById,
  getSpeakingPrompts,
  getSpeakingPromptsForLevel,
  mapCEFRToSpeakingDifficulty,
} from "@/lib/speaking-prompts";

describe("speaking prompts", () => {
<<<<<<< Updated upstream
  it("maps CEFR access to prompts in the matching difficulty band", () => {
=======
  it("maps CEFR access to the matching difficulty band", () => {
>>>>>>> Stashed changes
    const prompts = getSpeakingPromptsForLevel("B1");

    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((prompt) => prompt.difficulty === "medium")).toBe(true);
<<<<<<< Updated upstream
=======
  });

  it("filters prompts by major and difficulty", () => {
    const prompts = getSpeakingPrompts({
      majorId: "mechanical-engineering-transportation",
      difficulty: "medium",
    });

    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.every((prompt) => prompt.major_id === "mechanical-engineering-transportation")).toBe(true);
    expect(prompts.every((prompt) => prompt.difficulty === "medium")).toBe(true);
  });

  it("maps CEFR levels to speaking difficulty bands", () => {
    expect(mapCEFRToSpeakingDifficulty("A2")).toBe("low");
    expect(mapCEFRToSpeakingDifficulty("B1")).toBe("medium");
    expect(mapCEFRToSpeakingDifficulty("B2")).toBe("high");
>>>>>>> Stashed changes
  });

  it("looks up a prompt by id", () => {
    const prompt = getSpeakingPromptById("transport-high-mobility-policy");

    expect(prompt?.title).toBe("Respond to a mobility policy");
    expect(prompt?.partner_role).toBe("policy tutor");
  });
});
