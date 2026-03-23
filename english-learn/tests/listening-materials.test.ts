import { describe, expect, it } from "vitest";

import {
  buildListeningSentenceSegments,
  findEvidenceSentence,
  getListeningMaterial,
  getListeningMaterialOptions,
  getTedListeningMaterial,
  listeningMaterials,
  listeningMajors,
  practiceListeningMaterials,
  scoreShadowingAttempt,
  scoreListeningMaterial,
  tedListeningMaterials,
} from "@/lib/listening-materials";

describe("listening materials", () => {
  it("covers all five DIICSU majors with two practice sets, three accent variants each, and four TED talks each", () => {
    expect(listeningMajors).toHaveLength(5);
    expect(practiceListeningMaterials).toHaveLength(30);
    expect(tedListeningMaterials).toHaveLength(20);
    expect(listeningMaterials).toHaveLength(50);

    for (const major of listeningMajors) {
      const variants = practiceListeningMaterials.filter((item) => item.majorId === major.id);
      const options = getListeningMaterialOptions(practiceListeningMaterials, "practice", major.id);
      const tedVariants = tedListeningMaterials.filter((item) => item.majorId === major.id);

      expect(variants).toHaveLength(6);
      expect(options).toHaveLength(2);
      expect(new Set(variants.map((item) => item.materialGroupId)).size).toBe(2);
      expect(
        variants.every((item) => typeof item.audioSrc === "string" && item.audioSrc.endsWith(".m4a")),
      ).toBe(true);

      expect(tedVariants).toHaveLength(4);
      expect(new Set(tedVariants.map((item) => item.materialGroupId)).size).toBe(4);
      expect(tedVariants.every((item) => item.contentMode === "ted")).toBe(true);
      expect(tedVariants.every((item) => item.embedUrl?.includes("embed.ted.com/talks/"))).toBe(true);
      expect(tedVariants.every((item) => item.officialUrl?.includes("ted.com/talks/"))).toBe(true);
      expect(tedVariants.every((item) => item.thumbnailUrl?.startsWith("https://"))).toBe(true);
      expect(tedVariants.every((item) => item.audioSrc === null)).toBe(true);
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
    const tedOptions = getListeningMaterialOptions(listeningMaterials, "ted");

    expect(tedMaterial.contentMode).toBe("ted");
    expect(tedMaterial.speakerName).toBe("Joseph Redmon");
    expect(tedMaterial.transcriptUrl).toContain("/transcript");
    expect(tedMaterial.audioVoice).toBeNull();
    expect(tedOptions).toHaveLength(20);
  });

  it("can retrieve a specific TED material group for a major", () => {
    const tedMaterial = getTedListeningMaterial(
      "mechanical-engineering-transportation",
      "ted-transport-walkable-4-ways",
    );

    expect(tedMaterial.materialGroupLabel).toBe("4 ways to make a city more walkable");
    expect(tedMaterial.speakerName).toBe("Jeff Speck");
    expect(tedMaterial.officialUrl).toContain("jeff_speck_4_ways_to_make_a_city_more_walkable");
  });

  it("can retrieve a specific practice material group for a major", () => {
    const material = getListeningMaterial(
      "computing-science",
      "american",
      "computing-science-deployment-rollback",
    );

    expect(material.materialGroupLabel).toBe("Deployment rollback");
    expect(material.id).toBe("computing-science-deployment-rollback-american");
    expect(material.title).toContain("rollback");
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
