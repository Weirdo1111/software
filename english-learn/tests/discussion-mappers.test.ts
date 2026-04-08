import { describe, expect, it } from "vitest";

import { toDiscussionPost } from "@/lib/discussion-mappers";

describe("discussion mappers", () => {
  it("maps post-level voice fields into the discussion post payload", () => {
    const post = toDiscussionPost(
      {
        id: BigInt(1),
        title: "Voice-first note",
        content: "",
        excerpt: "Voice post",
        audioData: "data:audio/webm;base64,abc123",
        audioMimeType: "audio/webm",
        audioDurationSec: 18,
        category: "speaking",
        likesCount: 0,
        pinned: false,
        createdAt: new Date("2026-04-08T12:00:00.000Z"),
        viewsCount: 4,
        author: {
          displayName: "Ken",
        },
        likes: [],
        comments: [],
      },
      BigInt(99),
    );

    expect(post.audioDataUrl).toBe("data:audio/webm;base64,abc123");
    expect(post.audioMimeType).toBe("audio/webm");
    expect(post.audioDurationSec).toBe(18);
  });
});
