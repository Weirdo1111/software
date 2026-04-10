import { describe, expect, it } from "vitest";

import { containsNonEnglishContent, hasNonEnglishContent } from "@/lib/ai/language";

describe("AI language guard", () => {
  it("accepts plain English text", () => {
    expect(containsNonEnglishContent("Please answer in clear spoken English.")).toBe(false);
  });

  it("rejects Chinese text", () => {
    expect(containsNonEnglishContent("请全程使用英文回答。")).toBe(true);
  });

  it("rejects nested objects that contain non-English content", () => {
    expect(
      hasNonEnglishContent({
        reply: "Your answer is clear.",
        follow_up: "你可以再举一个例子吗？",
        coaching_note: "Keep the next turn concise.",
      }),
    ).toBe(true);
  });
});
