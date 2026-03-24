import { describe, expect, it } from "vitest";

import { buildPracticePassageFromArticle, getReadingArticleById } from "@/lib/reading-articles";
import { getPassageForLevel } from "@/lib/reading-passages";

describe("reading passages", () => {
  it("maps A1 to its own starter passage", () => {
    const a1Passage = getPassageForLevel("A1");
    const a2Passage = getPassageForLevel("A2");

    expect(a1Passage.level).toBe("A1");
    expect(a1Passage.title).not.toBe(a2Passage.title);
  });

  it("builds article-linked practice content from the selected reading article", () => {
    const article = getReadingArticleById("ai-in-higher-education");

    expect(article).toBeDefined();

    const passage = buildPracticePassageFromArticle(article!);

    expect(passage.title).toBe(article!.title);
    expect(passage.level).toBe(article!.cefr);
    expect(passage.vocab_options).toEqual(article!.keywords.slice(0, 5));
    expect(passage.paragraphs.join(" ")).toContain("Artificial intelligence is becoming part of everyday university study.");
  });
});
