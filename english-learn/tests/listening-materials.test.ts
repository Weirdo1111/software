import { describe, expect, it } from "vitest";

import {
  authenticListeningMaterials,
  buildListeningSentenceSegments,
  findEvidenceSentence,
  getTedListeningMaterial,
  hasStableInlinePreview,
  listeningMaterials,
  listeningMajors,
  practiceListeningMaterials,
  scoreShadowingAttempt,
  scoreListeningMaterial,
  tedListeningMaterials,
} from "@/lib/listening-materials";

describe("listening materials", () => {
  it("keeps a real-source listening library for all five DIICSU majors", () => {
    expect(listeningMajors).toHaveLength(5);
    expect(practiceListeningMaterials).toHaveLength(0);
    expect(tedListeningMaterials).toHaveLength(30);
    expect(authenticListeningMaterials).toHaveLength(10);
    expect(listeningMaterials).toHaveLength(40);

    for (const major of listeningMajors) {
      const majorMaterials = listeningMaterials.filter((item) => item.majorId === major.id);
      const tedForMajor = tedListeningMaterials.filter((item) => item.majorId === major.id);
      const authenticForMajor = authenticListeningMaterials.filter(
        (item) => item.majorId === major.id,
      );

      expect(majorMaterials).toHaveLength(8);
      expect(tedForMajor).toHaveLength(6);
      expect(authenticForMajor).toHaveLength(2);
      expect(majorMaterials.every((item) => item.contentMode !== "practice")).toBe(true);
      expect(majorMaterials.every((item) => item.audioSrc === null)).toBe(true);
    }

    expect(authenticListeningMaterials.some((item) => item.resourceType === "lecture")).toBe(true);
    expect(authenticListeningMaterials.some((item) => item.resourceType === "interview")).toBe(true);
    expect(authenticListeningMaterials.some((item) => item.resourceType === "podcast")).toBe(true);
    expect(tedListeningMaterials.filter((item) => item.isCrossDisciplinary).length).toBe(12);
  });

  it("keeps TED items retrievable for each major", () => {
    const tedMaterial = getTedListeningMaterial("computing-science");

    expect(tedMaterial.contentMode).toBe("ted");
    expect(tedMaterial.resourceType).toBe("real-talk");
    expect(tedMaterial.speakerName).toBe("Joseph Redmon");
    expect(tedMaterial.transcriptUrl).toContain("/transcript");
    expect(tedMaterial.audioVoice).toBeNull();
  });

  it("keeps official cover images for all TED listening cards", () => {
    expect(
      tedListeningMaterials.every(
        (item) =>
          typeof item.thumbnailUrl === "string" && item.thumbnailUrl.startsWith("https://"),
      ),
    ).toBe(true);
  });

  it("keeps only stable inline previews for the main listening gallery", () => {
    const tedMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "ted-civil-climate-resilient-buildings",
    );
    const youtubeMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "civil-bridge-maintenance-cambridge",
    );

    expect(tedMaterial).toBeTruthy();
    expect(youtubeMaterial).toBeTruthy();
    expect(hasStableInlinePreview(tedMaterial!)).toBe(true);
    expect(hasStableInlinePreview(youtubeMaterial!)).toBe(false);
  });

  it("scores a strong authentic-source answer correctly", () => {
    const material = listeningMaterials.find(
      (item) => item.materialGroupId === "civil-bridge-maintenance-cambridge",
    );

    expect(material).toBeTruthy();

    const result = scoreListeningMaterial(
      material!,
      {
        gist: "The lecture says bridge maintenance should be planned with data and prioritisation.",
        detail: "Inspection records and monitoring data support the decisions.",
        signpost: "Earlier action improves safety and limited budgets.",
        term: "asset management",
      },
      "Bridge maintenance should be data-led with better prioritisation and asset management.",
      "B1",
    );

    expect(result.correctCount).toBe(4);
    expect(result.passed).toBe(true);
    expect(result.overallScore).toBe(10);
  });

  it("builds sentence segments for authentic materials with study transcripts", () => {
    const material = listeningMaterials.find(
      (item) => item.materialGroupId === "mechanical-nature-3d-printer",
    );

    expect(material).toBeTruthy();

    const segments = buildListeningSentenceSegments(material!);

    expect(segments.length).toBeGreaterThan(2);
    expect(segments[0]?.startRatio).toBe(0);
    expect(segments.at(-1)?.endRatio).toBe(1);
  });

  it("finds an evidence sentence from an authentic-source study transcript", () => {
    const material = listeningMaterials.find(
      (item) => item.materialGroupId === "computing-software-changing-stanford",
    );

    expect(material).toBeTruthy();

    const detailQuestion = material?.questions.find((question) => question.id === "detail");

    expect(detailQuestion).toBeTruthy();
    expect(findEvidenceSentence(material!, detailQuestion!)).toContain("prompting");
  });

  it("scores shadowing attempts based on authentic listening prompts", () => {
    const score = scoreShadowingAttempt(
      "The interview looks at how additive manufacturing is used inside a hypercar programme.",
      "The interview explains how additive manufacturing is used in a hypercar program.",
    );

    expect(score.overallScore).toBeGreaterThan(65);
    expect(score.matchedKeywords).toContain("additive");
    expect(score.matchedKeywords).toContain("hypercar");
  });
});
