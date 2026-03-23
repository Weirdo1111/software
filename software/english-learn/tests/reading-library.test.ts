import { describe, expect, it } from "vitest";

import { recordReadingHistory, toggleFavoriteId } from "@/lib/reading-library";

describe("reading library helpers", () => {
  it("toggles favorites on and off", () => {
    expect(toggleFavoriteId([], "article-1")).toEqual(["article-1"]);
    expect(toggleFavoriteId(["article-1", "article-2"], "article-1")).toEqual(["article-2"]);
  });

  it("records reading history and moves the latest visit to the front", () => {
    const first = recordReadingHistory([], "article-1", "2026-03-17T10:00:00.000Z");

    expect(first).toEqual([
      {
        articleId: "article-1",
        viewedAt: "2026-03-17T10:00:00.000Z",
        viewCount: 1,
      },
    ]);

    const second = recordReadingHistory(
      [
        {
          articleId: "article-2",
          viewedAt: "2026-03-17T09:30:00.000Z",
          viewCount: 1,
        },
        ...first,
      ],
      "article-1",
      "2026-03-17T11:15:00.000Z",
    );

    expect(second[0]).toEqual({
      articleId: "article-1",
      viewedAt: "2026-03-17T11:15:00.000Z",
      viewCount: 2,
    });
    expect(second[1]?.articleId).toBe("article-2");
  });
});
