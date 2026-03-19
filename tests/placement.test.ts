import { describe, expect, it } from "vitest";

import { evaluatePlacement, getPlacementQuestionSet } from "@/lib/placement";

describe("placement", () => {
  it("returns A1 for low scores", () => {
    const questions = getPlacementQuestionSet(10);
    const answers = questions.map(() => -1);
    const result = evaluatePlacement(answers);

    expect(result.cefr_level).toBe("A1");
  });

  it("returns B2 for high scores", () => {
    const questions = getPlacementQuestionSet(10);
    const answers = questions.map((q) => q.answer);
    const result = evaluatePlacement(answers);

    expect(result.cefr_level).toBe("B2");
    expect(result.score).toBeGreaterThanOrEqual(8);
  });
});
