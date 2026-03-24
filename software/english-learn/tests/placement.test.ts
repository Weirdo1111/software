import { describe, expect, it } from "vitest";

import { evaluatePlacement, getPlacementQuestionSet, placementQuestions } from "@/lib/placement";

describe("placement", () => {
  it("returns a unique four-skill question set without repeating items", () => {
    const questions = getPlacementQuestionSet();

    expect(questions).toHaveLength(placementQuestions.length);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.skill))).toEqual(new Set(["listening", "speaking", "reading", "writing"]));
  });

  it("returns A1 for low scores", () => {
    const answers = placementQuestions.map(() => -1);
    const result = evaluatePlacement(answers);

    expect(result.cefr_level).toBe("A1");
    expect(result.band_label).toBe("Low");
    expect(result.score).toBe(0);
  });

  it("returns A2 at the first threshold boundary", () => {
    const answers = placementQuestions.map((question, index) => (index < 5 ? question.answer : -1));
    const result = evaluatePlacement(answers);

    expect(result.cefr_level).toBe("A2");
    expect(result.score).toBe(5);
  });

  it("returns B1 when the learner clears the middle band", () => {
    const answers = placementQuestions.map((question, index) => (index < 9 ? question.answer : -1));
    const result = evaluatePlacement(answers);

    expect(result.cefr_level).toBe("B1");
    expect(result.band_label).toBe("Medium");
    expect(result.recommended_focus).toBeTruthy();
  });

  it("returns B2 for high scores and reports skill breakdown", () => {
    const answers = placementQuestions.map((question) => question.answer);
    const result = evaluatePlacement(answers);

    expect(result.cefr_level).toBe("B2");
    expect(result.band_label).toBe("High");
    expect(result.score).toBe(placementQuestions.length);
    expect(result.total_questions).toBe(placementQuestions.length);
    expect(result.skill_breakdown).toEqual({
      listening: 4,
      speaking: 4,
      reading: 4,
      writing: 4,
    });
  });
});
