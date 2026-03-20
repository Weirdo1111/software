import { describe, expect, it } from "vitest";

import {
  buildListeningSentenceSegments,
  findEvidenceSentence,
  getListeningMaterial,
  getTedListeningMaterial,
  listeningMaterials,
  listeningMajors,
  practiceListeningMaterials,
  scoreShadowingAttempt,
  scoreListeningMaterial,
  tedListeningMaterials,
} from "@/lib/listening-materials";

describe("listening materials", () => {
  it("covers all five DIICSU majors with three accent variants each and one TED talk each", () => {
    expect(listeningMajors).toHaveLength(5);
    expect(practiceListeningMaterials).toHaveLength(15);
    expect(tedListeningMaterials).toHaveLength(5);
    expect(listeningMaterials).toHaveLength(20);

    for (const major of listeningMajors) {
      const variants = practiceListeningMaterials.filter((item) => item.majorId === major.id);
      expect(variants).toHaveLength(3);
      expect(
        variants.every((item) => typeof item.audioSrc === "string" && item.audioSrc.endsWith(".m4a")),
      ).toBe(true);

      const tedVariant = tedListeningMaterials.find((item) => item.majorId === major.id);
      expect(tedVariant?.contentMode).toBe("ted");
      expect(tedVariant?.embedUrl).toContain("embed.ted.com/talks/");
      expect(tedVariant?.officialUrl).toContain("ted.com/talks/");
      expect(tedVariant?.audioSrc).toBeNull();
    }
  });

  it("scores strong civil-engineering answers correctly", () => {
    const material = getListeningMaterial("civil-engineering", "british");
    const result = scoreListeningMaterial(
      material,
      {
        gist: "It is a drainage inspection plan after heavy rain.",
        detail: "The east retaining wall should be checked first.",
        signpost: "The key point is",
        term: "runoff",
      },
      "Drainage check at east retaining wall. Runoff and blocked channels matter.",
      "B1",
    );

    expect(result.correctCount).toBe(4);
    expect(result.passed).toBe(true);
    expect(result.overallScore).toBe(10);
    expect(result.questionFeedback[0]?.evidenceSentence).toContain("drainage");
  });

  it("returns a TED material for each DIICSU major", () => {
    const tedMaterial = getTedListeningMaterial("computing-science");

    expect(tedMaterial.contentMode).toBe("ted");
    expect(tedMaterial.speakerName).toBe("Joseph Redmon");
    expect(tedMaterial.transcriptUrl).toContain("/transcript");
    expect(tedMaterial.audioVoice).toBeNull();
  });

  it("builds sentence segments with stable ordering for practice clips", () => {
    const material = getListeningMaterial("mechanical-engineering", "american");
    const segments = buildListeningSentenceSegments(material);

    expect(segments.length).toBeGreaterThan(3);
    expect(segments[0]?.startRatio).toBe(0);
    expect(segments.at(-1)?.endRatio).toBe(1);
  });

  it("finds an evidence sentence for the retaining-wall detail question", () => {
    const material = getListeningMaterial("civil-engineering", "british");
    const detailQuestion = material.questions.find((question) => question.id === "detail");

    expect(detailQuestion).toBeTruthy();
    expect(findEvidenceSentence(material, detailQuestion!)).toContain("east retaining wall");
  });

  it("scores shadowing attempts based on keyword coverage", () => {
    const score = scoreShadowingAttempt(
      "Record the slope, the drain outlet, and any blocked channels.",
      "Record the slope and the drain outlet before blocked channels.",
    );

    expect(score.overallScore).toBeGreaterThan(70);
    expect(score.matchedKeywords).toContain("slope");
    expect(score.missingKeywords.length).toBeLessThan(score.matchedKeywords.length + 1);
  });
});
