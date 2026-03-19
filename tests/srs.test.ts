import { describe, expect, it } from "vitest";

import { calculateNextReview } from "@/lib/srs";

describe("srs", () => {
  it("increases stability for good ratings", () => {
    const result = calculateNextReview({
      stability: 3,
      difficulty: 5,
      rating: 4,
    });

    expect(result.next_stability).toBeGreaterThan(3);
  });

  it("reduces stability for failed recall", () => {
    const result = calculateNextReview({
      stability: 3,
      difficulty: 5,
      rating: 1,
    });

    expect(result.next_stability).toBeLessThan(3);
  });
});
