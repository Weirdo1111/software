import { describe, expect, it } from "vitest";

import {
  authenticListeningMaterials,
  buildListeningCoverDataUrl,
  buildListeningSentenceSegments,
  findEvidenceSentence,
  getListeningPlaybackMode,
  getListeningSourceProvider,
  getListeningStudyText,
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
    expect(tedListeningMaterials).toHaveLength(60);
    expect(authenticListeningMaterials.length).toBeGreaterThanOrEqual(20);
    expect(listeningMaterials).toHaveLength(
      tedListeningMaterials.length + authenticListeningMaterials.length,
    );

    for (const major of listeningMajors) {
      const majorMaterials = listeningMaterials.filter((item) => item.majorId === major.id);
      const tedForMajor = tedListeningMaterials.filter((item) => item.majorId === major.id);
      const authenticForMajor = authenticListeningMaterials.filter(
        (item) => item.majorId === major.id,
      );

      expect(majorMaterials.length).toBeGreaterThanOrEqual(15);
      expect(tedForMajor.length).toBeGreaterThanOrEqual(10);
      expect(authenticForMajor.length).toBeGreaterThanOrEqual(4);
      expect(majorMaterials).toHaveLength(tedForMajor.length + authenticForMajor.length);
      expect(majorMaterials.every((item) => item.contentMode !== "practice")).toBe(true);
      expect(tedForMajor.every((item) => item.audioSrc === null)).toBe(true);
    }

    expect(authenticListeningMaterials.some((item) => item.resourceType === "lecture")).toBe(true);
    expect(authenticListeningMaterials.some((item) => item.resourceType === "interview")).toBe(true);
    expect(authenticListeningMaterials.some((item) => item.resourceType === "podcast")).toBe(true);
    expect(authenticListeningMaterials.some((item) => item.accent === "indian")).toBe(true);
    expect(tedListeningMaterials.filter((item) => item.isCrossDisciplinary).length).toBeGreaterThanOrEqual(
      30,
    );

    const tedLevelSet = new Set(tedListeningMaterials.map((item) => item.recommendedLevel));
    const tedRegionSet = new Set(tedListeningMaterials.map((item) => item.speakerRegion));

    expect(tedLevelSet).toEqual(new Set(["A1", "A2", "B1", "B2"]));
    expect(tedRegionSet).toEqual(
      new Set(["north-america", "british", "europe", "asia", "latin-america", "other"]),
    );

    const providerSet = new Set(listeningMaterials.map((item) => getListeningSourceProvider(item)));

    expect(providerSet.has("ted")).toBe(true);
    expect(providerSet.has("mit-ocw")).toBe(true);
    expect(providerSet.has("nptel")).toBe(true);
    expect(providerSet.has("stanford")).toBe(true);
    expect(providerSet.size).toBeGreaterThanOrEqual(6);
  });

  it("keeps TED items retrievable for each major", () => {
    const tedMaterial = getTedListeningMaterial("computing-science");

    expect(tedMaterial.contentMode).toBe("ted");
    expect(tedMaterial.resourceType).toBe("real-talk");
    expect(tedMaterial.speakerName).toBe("Joseph Redmon");
    expect(tedMaterial.transcriptUrl).toContain("/transcript");
    expect(tedMaterial.audioVoice).toBeNull();
  });

  it("keeps stable cover images for all TED listening cards", () => {
    expect(
      tedListeningMaterials.every(
        (item) =>
          (typeof item.thumbnailUrl === "string" && item.thumbnailUrl.startsWith("https://")) ||
          buildListeningCoverDataUrl(item).startsWith("data:image/svg+xml"),
      ),
    ).toBe(true);
  });

  it("keeps cover images for all authentic-source cards and in-app audio for selected items", () => {
    expect(
      authenticListeningMaterials.every(
        (item) =>
          (typeof item.thumbnailUrl === "string" && item.thumbnailUrl.startsWith("https://")) ||
          buildListeningCoverDataUrl(item).startsWith("data:image/svg+xml"),
      ),
    ).toBe(true);

    const naturePodcast = authenticListeningMaterials.find(
      (item) => item.materialGroupId === "mechanical-nature-3d-printer",
    );

    expect(naturePodcast).toBeTruthy();
    expect(naturePodcast?.audioSrc).toContain("media.nature.com");
  });

  it("keeps every library item playable inside the app", () => {
    const tedMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "ted-civil-climate-resilient-buildings",
    );
    const directCivilMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "civil-bridge-maintenance-cambridge",
    );
    const audioFallbackMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "computing-nptel-dsa",
    );
    const stanfordMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "maths-stanford-linear-systems",
    );
    const dijkstraMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "computing-mit-dijkstra",
    );

    expect(tedMaterial).toBeTruthy();
    expect(directCivilMaterial).toBeTruthy();
    expect(audioFallbackMaterial).toBeTruthy();
    expect(stanfordMaterial).toBeTruthy();
    expect(dijkstraMaterial).toBeTruthy();
    expect(hasStableInlinePreview(tedMaterial!)).toBe(true);
    expect(hasStableInlinePreview(directCivilMaterial!)).toBe(true);
    expect(hasStableInlinePreview(audioFallbackMaterial!)).toBe(false);
    expect(hasStableInlinePreview(stanfordMaterial!)).toBe(true);
    expect(directCivilMaterial?.videoSrc).toContain("archive.org");
    expect(audioFallbackMaterial?.audioSrc).toContain("/audio/listening/");
    expect(stanfordMaterial?.videoSrc).toContain("html5.stanford.edu");
    expect(dijkstraMaterial?.videoSrc).toContain("archive.org");
    expect(
      listeningMaterials.every((item) => hasStableInlinePreview(item) || item.audioSrc !== null),
    ).toBe(true);
    expect(getListeningPlaybackMode(tedMaterial!)).toBe("ted-player");
    expect(getListeningPlaybackMode(directCivilMaterial!)).toBe("direct-video");
    expect(getListeningPlaybackMode(audioFallbackMaterial!)).toBe("audio");
    expect(getListeningPlaybackMode(stanfordMaterial!)).toBe("direct-video");
  });

  it("builds generated cover art for items whose remote thumbnails are unstable", () => {
    const generatedCoverMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "computing-ai-healthcare-stanford",
    );

    expect(generatedCoverMaterial).toBeTruthy();
    expect(buildListeningCoverDataUrl(generatedCoverMaterial!)).toContain("data:image/svg+xml");
  });

  it("keeps a study-text path for every listening material", () => {
    expect(
      listeningMaterials.every((item) => getListeningStudyText(item).trim().length > 0),
    ).toBe(true);

    const tedMaterial = listeningMaterials.find(
      (item) => item.materialGroupId === "ted-computing-ai-coder",
    );

    expect(tedMaterial).toBeTruthy();
    expect(tedMaterial?.transcript).toBe("");
    expect(getListeningStudyText(tedMaterial!)).toBe(
      `${tedMaterial!.scenario}\n\n${tedMaterial!.supportFocus}`,
    );
  });

  it("scores a strong authentic-source answer correctly", () => {
    const material = listeningMaterials.find(
      (item) => item.materialGroupId === "civil-bridge-maintenance-cambridge",
    );

    expect(material).toBeTruthy();

    const result = scoreListeningMaterial(
      material!,
      {
        gist: "The lecture explains how trusses are analysed by connecting members and joints to equilibrium and matrix methods.",
        detail: "It emphasises joint equilibrium, member forces, and stiffness.",
        signpost: "The matrix form helps engineers solve larger structures while preserving load paths.",
        term: "stiffness matrix",
      },
      "Truss analysis becomes clearer when engineers move from the physical structure to equilibrium equations and a stiffness matrix.",
      "B2",
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
    expect(findEvidenceSentence(material!, detailQuestion!)).toContain(
      "depth-first and breadth-first search",
    );
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
