import { describe, expect, it } from "vitest";

import {
  recordListeningCompletion,
  recordListeningHistory,
  toggleFavoriteGroupId,
} from "@/lib/listening-library";

describe("listening library helpers", () => {
  it("toggles favorite material groups on and off", () => {
    expect(toggleFavoriteGroupId([], "civil-engineering")).toEqual(["civil-engineering"]);
    expect(toggleFavoriteGroupId(["civil-engineering", "mathematics"], "civil-engineering")).toEqual([
      "mathematics",
    ]);
  });

  it("records listening history and moves the latest material to the front", () => {
    const first = recordListeningHistory([], "civil-engineering", "2026-03-21T09:00:00.000Z");

    expect(first).toEqual([
      {
        groupId: "civil-engineering",
        viewedAt: "2026-03-21T09:00:00.000Z",
        viewCount: 1,
      },
    ]);

    const second = recordListeningHistory(
      [
        {
          groupId: "mathematics",
          viewedAt: "2026-03-21T08:30:00.000Z",
          viewCount: 1,
        },
        ...first,
      ],
      "civil-engineering",
      "2026-03-21T10:15:00.000Z",
    );

    expect(second[0]).toEqual({
      groupId: "civil-engineering",
      viewedAt: "2026-03-21T10:15:00.000Z",
      viewCount: 2,
    });
    expect(second[1]?.groupId).toBe("mathematics");
  });

  it("records listening completions and keeps the best score", () => {
    const first = recordListeningCompletion(
      [],
      "computing-science-deployment-rollback",
      7,
      false,
      "2026-03-21T11:00:00.000Z",
    );

    expect(first).toEqual([
      {
        groupId: "computing-science-deployment-rollback",
        completedAt: "2026-03-21T11:00:00.000Z",
        attempts: 1,
        bestScore: 7,
        passed: false,
      },
    ]);

    const second = recordListeningCompletion(
      first,
      "computing-science-deployment-rollback",
      9,
      true,
      "2026-03-21T12:20:00.000Z",
    );

    expect(second[0]).toEqual({
      groupId: "computing-science-deployment-rollback",
      completedAt: "2026-03-21T12:20:00.000Z",
      attempts: 2,
      bestScore: 9,
      passed: true,
    });
  });
});
