import { describe, expect, it } from "vitest";

import { getListeningProgress, isChoiceCorrect, listeningWeekOneItems } from "@/lib/listening";

describe("listening week-one logic", () => {
  it("keeps week-one item count at or above 3", () => {
    expect(listeningWeekOneItems.length).toBeGreaterThanOrEqual(3);
  });

  it("checks comprehension answers", () => {
    expect(isChoiceCorrect(1, 1)).toBe(true);
    expect(isChoiceCorrect(2, 1)).toBe(false);
  });

  it("calculates progress safely", () => {
    expect(getListeningProgress(0, 3)).toBe(33);
    expect(getListeningProgress(2, 3)).toBe(100);
    expect(getListeningProgress(0, 0)).toBe(0);
  });
});
