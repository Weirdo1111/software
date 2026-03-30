"use client";

import {
  BookMarked,
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useSearchParams } from "next/navigation";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { ContextDock } from "@/components/context-comments/context-dock";
import { SaveToDeckButton } from "@/components/forms/save-to-deck-button";
import {
  listeningMajors,
  listeningMaterials,
  scoreListeningMaterial,
  speakerRegions,
  tedListeningMaterials,
  type DIICSUMajorId,
  type ListeningMaterial,
  type SpeakerRegion,
} from "@/lib/listening-materials";
import {
  getListeningLibraryServerSnapshot,
  getListeningLibrarySnapshot,
  recordListeningCompletionInStorage,
  recordListeningHistoryInStorage,
  subscribeListeningLibrary,
} from "@/lib/listening-library";
import { recordSkillAttemptInStorage } from "@/lib/learning-tracker";
import { cn } from "@/lib/utils";
import { getDifficultyLabel } from "@/lib/level-labels";
import type { CEFRLevel, ListeningAIFeedback } from "@/types/learning";

type MajorFilter = "all" | DIICSUMajorId;
type LevelFilter = "all" | CEFRLevel;
type RegionFilter = "all" | SpeakerRegion;

const tedThumbnailFallbackMap = new Map(
  tedListeningMaterials.map((material) => [material.materialGroupId, material.thumbnailUrl]),
);

function buildAnswerState(questionIds: string[]) {
  return Object.fromEntries(questionIds.map((id) => [id, ""])) as Record<string, string>;
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getMaterialByGroupId(materials: ListeningMaterial[], groupId: string) {
  return materials.find((material) => material.materialGroupId === groupId) ?? null;
}

function getMaterialThumbnail(material: ListeningMaterial) {
  return material.thumbnailUrl ?? tedThumbnailFallbackMap.get(material.materialGroupId) ?? null;
}

/** Image with graceful fallback 鈥?hides alt text when load fails */
function TedThumbnail({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  /* eslint-disable @next/next/no-img-element */
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
  /* eslint-enable @next/next/no-img-element */
}

export function ListeningFeedbackForm({
  defaultLevel = "B1",
  materials,
}: {
  defaultLevel?: CEFRLevel;
  materials?: ListeningMaterial[];
}) {
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "zh" ? "zh" : "en";
  const catalog = materials && materials.length > 0 ? materials : listeningMaterials;
  const tedCatalog = useMemo(
    () =>
      [...catalog.filter((material) => material.contentMode === "ted")].sort(
        (left, right) =>
          left.majorLabel.localeCompare(right.majorLabel) ||
          left.materialGroupLabel.localeCompare(right.materialGroupLabel),
      ),
    [catalog],
  );

  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<MajorFilter>("all");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<LevelFilter>("all");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<RegionFilter>("all");
  const [selectedMaterialGroupId, setSelectedMaterialGroupId] = useState(
    () => tedCatalog[0]?.materialGroupId ?? "",
  );
  const [showTedEmbed, setShowTedEmbed] = useState(false);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<ReturnType<typeof scoreListeningMaterial> | null>(null);
  const [submitStatus, setSubmitStatus] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [attemptStartedAt, setAttemptStartedAt] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiFeedback, setAiFeedback] = useState<ListeningAIFeedback | null>(null);
  const [isAIScoring, setIsAIScoring] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const recordedHistoryGroupIdsRef = useRef<Set<string>>(new Set());

  const librarySnapshot = useSyncExternalStore(
    subscribeListeningLibrary,
    getListeningLibrarySnapshot,
    getListeningLibraryServerSnapshot,
  );

  const completionMap = useMemo(
    () => new Map(librarySnapshot.completions.map((entry) => [entry.groupId, entry])),
    [librarySnapshot.completions],
  );

  const levelOptions = useMemo(() => {
    const levels = Array.from(new Set(tedCatalog.map((material) => material.recommendedLevel)));
    return ["all", ...levels] as LevelFilter[];
  }, [tedCatalog]);

  const availableRegions = useMemo(() => {
    const regionSet = new Set(tedCatalog.map((material) => material.speakerRegion).filter(Boolean));
    return speakerRegions.filter((r) => regionSet.has(r.id));
  }, [tedCatalog]);

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(deferredSearchValue);

    return tedCatalog.filter((material) => {
      const matchesMajor =
        selectedMajorFilter === "all" || material.majorId === selectedMajorFilter;
      const matchesLevel =
        selectedLevelFilter === "all" || material.recommendedLevel === selectedLevelFilter;
      const matchesRegion =
        selectedRegionFilter === "all" || material.speakerRegion === selectedRegionFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeSearchValue(
          [
            material.title,
            material.materialGroupLabel,
            material.majorLabel,
            material.speakerName ?? "",
            material.speakerRole,
            material.scenario,
            material.supportFocus,
          ].join(" "),
        ).includes(normalizedSearch);

      return matchesMajor && matchesLevel && matchesRegion && matchesSearch;
    });
  }, [deferredSearchValue, selectedLevelFilter, selectedMajorFilter, selectedRegionFilter, tedCatalog]);

  useEffect(() => {
    if (!selectedMaterialGroupId) {
      const fallbackGroupId = filteredMaterials[0]?.materialGroupId ?? tedCatalog[0]?.materialGroupId;

      if (fallbackGroupId) {
        setSelectedMaterialGroupId(fallbackGroupId);
      }
      return;
    }

    if (
      filteredMaterials.length > 0 &&
      !filteredMaterials.some((material) => material.materialGroupId === selectedMaterialGroupId)
    ) {
      setSelectedMaterialGroupId(filteredMaterials[0].materialGroupId);
    }
  }, [filteredMaterials, selectedMaterialGroupId, tedCatalog]);

  const activeMaterial = useMemo(
    () =>
      getMaterialByGroupId(tedCatalog, selectedMaterialGroupId) ??
      filteredMaterials[0] ??
      tedCatalog[0] ??
      null,
    [filteredMaterials, selectedMaterialGroupId, tedCatalog],
  );

  useEffect(() => {
    if (!activeMaterial) {
      return;
    }

    setNotes("");
    setResult(null);
    setSubmitStatus("");
    setShowTedEmbed(false);
    setAiFeedback(null);
    setAiStatus("");
    setAttemptStartedAt(Date.now());
    setAnswers(buildAnswerState(activeMaterial.questions.map((question) => question.id)));
  }, [activeMaterial]);

  useEffect(() => {
    if (!activeMaterial) {
      return;
    }

    if (recordedHistoryGroupIdsRef.current.has(activeMaterial.materialGroupId)) {
      return;
    }

    recordedHistoryGroupIdsRef.current.add(activeMaterial.materialGroupId);
    recordListeningHistoryInStorage(activeMaterial.materialGroupId);
  }, [activeMaterial]);

  if (!activeMaterial) {
    return (
      <section className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-6 shadow-[0_18px_38px_rgba(18,32,52,0.06)]">
        <p className="text-sm font-semibold text-[var(--ink)]">
          TED listening materials are not configured yet.
        </p>
      </section>
    );
  }

  const activeCompletion = completionMap.get(activeMaterial.materialGroupId);
  const activeThumbnail = getMaterialThumbnail(activeMaterial);
  const completedTedCount = tedCatalog.filter((material) =>
    completionMap.has(material.materialGroupId),
  ).length;
  const answeredCount = activeMaterial.questions.filter(
    (question) => (answers[question.id] ?? "").trim().length >= 2,
  ).length;
  const noteWordCount = countWords(notes);
  const discussionContext = {
    module: "listening" as const,
    targetId: activeMaterial.materialGroupId,
    title: activeMaterial.title,
    subtitle: activeMaterial.majorLabel,
    plazaTag: "Listening",
    topics: ["Notes", "Accent", "Terms", "Answers"],
    starters: [
      "The part I missed was",
      "The key term in this talk is",
      "The question I keep missing is",
    ],
    seedComments: [
      {
        author: "Tutor note",
        topic: "Notes",
        content:
          "Capture the main claim and one supporting example first, then fill in the detail.",
        createdAt: "2026-03-24T09:20:00.000Z",
        likes: 4,
      },
      {
        author: "Yuna",
        topic: "Accent",
        content:
          "The pace is manageable, but the signposts are soft. Track the transitions first.",
        createdAt: "2026-03-24T11:05:00.000Z",
        likes: 2,
      },
    ],
  };
  function handleMaterialSelect(groupId: string) {
    setSelectedMaterialGroupId(groupId);
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsScoring(true);
    setSubmitStatus("");

    try {
      const nextResult = scoreListeningMaterial(activeMaterial, answers, notes, defaultLevel);
      setResult(nextResult);
      recordListeningCompletionInStorage(
        activeMaterial.materialGroupId,
        nextResult.overallScore,
        nextResult.passed,
      );

      const durationSec = Math.max(45, Math.round((Date.now() - attemptStartedAt) / 1000));
      recordSkillAttemptInStorage("listening", {
        correct: nextResult.passed,
        durationSec,
        markCompleted: true,
      });

      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: `${activeMaterial.id}:ted-listening-check`,
          answer_payload: {
            major: activeMaterial.majorLabel,
            mode: activeMaterial.contentMode,
            accent: activeMaterial.accentLabel,
            source: activeMaterial.sourceName,
            level: defaultLevel,
            score: nextResult.overallScore,
            notes,
            answers,
            answer: nextResult.passed,
            correct_answer: true,
          },
          duration_sec: durationSec,
        }),
      }).catch(() => {});
    } catch (error) {
      setSubmitStatus(
        error instanceof Error ? error.message : "Listening check failed. Please try again.",
      );
    } finally {
      setIsScoring(false);
    }
  }

  async function onAIFeedback() {
    setIsAIScoring(true);
    setAiStatus("");
    setAiFeedback(null);

    try {
      const response = await fetch("/api/ai/feedback/listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talk_title: activeMaterial.title,
          speaker_name: activeMaterial.speakerName ?? "Unknown",
          scenario: activeMaterial.scenario,
          answers: {
            gist: answers["gist"] ?? "",
            detail: answers["detail"] ?? "",
            signpost: answers["signpost"] ?? "",
            term: answers["term"] ?? "",
          },
          notes,
          target_level: defaultLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate listening feedback.");
      }

      setAiFeedback(data as ListeningAIFeedback);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "AI feedback failed.";
      setAiStatus(message);
    } finally {
      setIsAIScoring(false);
    }
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">
            TED Listening
          </h2>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {tedCatalog.length} talks
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {completedTedCount} done
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <label className="block">
            <span className="sr-only">Search TED talks</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-soft)]" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search title, speaker, topic"
                className="w-full rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] py-3 pl-11 pr-4 text-sm outline-none"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            <span className="sr-only">Difficulty</span>
            <select
              value={selectedLevelFilter}
              onChange={(event) => setSelectedLevelFilter(event.target.value as LevelFilter)}
              className="rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] px-4 py-3 text-sm outline-none"
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level === "all" ? "All difficulties" : getDifficultyLabel(level)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedMajorFilter("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              selectedMajorFilter === "all"
                ? "bg-[var(--navy)] text-[#f7efe3]"
                : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
            )}
          >
            All majors
          </button>
          {listeningMajors.map((major) => (
            <button
              key={major.id}
              type="button"
              onClick={() => setSelectedMajorFilter(major.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                selectedMajorFilter === major.id
                  ? "bg-[var(--navy)] text-[#f7efe3]"
                  : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
              )}
            >
              {major.label}
            </button>
          ))}
        </div>

        {availableRegions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedRegionFilter("all")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                selectedRegionFilter === "all"
                  ? "bg-[var(--coral)] text-white"
                  : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
              )}
            >
              All regions
            </button>
            {availableRegions.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegionFilter(region.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  selectedRegionFilter === region.id
                    ? "bg-[var(--coral)] text-white"
                    : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
                )}
              >
                {region.label}
              </button>
            ))}
          </div>
        )}
      </article>

      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
              {activeMaterial.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {activeMaterial.speakerName
                ? `${activeMaterial.speakerName} 路 ${activeMaterial.durationLabel}`
                : activeMaterial.durationLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {activeMaterial.majorLabel}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {getDifficultyLabel(activeMaterial.recommendedLevel)}
            </span>
            {activeCompletion ? (
              <span className="rounded-full border border-[#6a9483]/35 bg-[#edf6f1] px-3 py-1.5 text-[#315f4f]">
                Best {activeCompletion.bestScore}/10
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{activeMaterial.scenario}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {activeMaterial.embedUrl ? (
            <button
              type="button"
              onClick={() => setShowTedEmbed((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3]"
            >
              <PlayCircle className="size-4" />
              {showTedEmbed ? "Hide preview" : "Preview this talk"}
            </button>
          ) : null}

          {activeMaterial.officialUrl ? (
            <a
              href={activeMaterial.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              <ExternalLink className="size-4" />
              Watch on TED
            </a>
          ) : null}

          {activeMaterial.transcriptUrl ? (
            <a
              href={activeMaterial.transcriptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              <FileText className="size-4" />
              Transcript
            </a>
          ) : null}
        </div>
      </article>

      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="mt-1 grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => {
            const isActive = material.materialGroupId === activeMaterial.materialGroupId;
            const thumbnail = getMaterialThumbnail(material);
            const completion = completionMap.get(material.materialGroupId);

            return (
              <button
                key={material.materialGroupId}
                type="button"
                onClick={() => handleMaterialSelect(material.materialGroupId)}
                className="group text-left"
              >
                <article
                  className={cn(
                    "rounded-[1.35rem] border bg-white p-2.5 shadow-[0_10px_28px_rgba(19,32,52,0.05)] transition-all",
                    isActive
                      ? "border-[var(--navy)] shadow-[0_18px_34px_rgba(27,52,90,0.12)]"
                      : "border-[rgba(20,50,75,0.08)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(19,32,52,0.08)]",
                  )}
                >
                  <div className="relative aspect-video overflow-hidden rounded-[1rem] bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]">
                    {thumbnail ? (
                      <TedThumbnail
                        src={thumbnail}
                        alt={material.title}
                        className="transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,18,32,0.76)] to-transparent" />
                    <div className="absolute left-3 top-3 rounded bg-[#eb0028] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                      TED
                    </div>
                    <div className="absolute bottom-3 right-3 rounded bg-[rgba(12,22,35,0.88)] px-2 py-1 text-[11px] font-semibold text-white">
                      {material.durationLabel.replace(" TED Talk", "")}
                    </div>
                  </div>

                  <div className="mt-2.5 px-1">
                    <h4 className="text-sm font-semibold leading-5 text-[var(--ink)]">
                      {material.title}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">
                      {material.speakerName} 路 {material.majorLabel} 路 {getDifficultyLabel(material.recommendedLevel)}
                    </p>
                    {completion ? (
                      <p className="mt-1 text-xs font-semibold text-[#315f4f]">
                        Best {completion.bestScore}/10
                      </p>
                    ) : null}
                  </div>
                </article>
              </button>
            );
          })}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="rounded-[1.2rem] border border-dashed border-[rgba(20,50,75,0.16)] bg-[rgba(247,250,252,0.72)] p-6 text-center">
            <p className="text-sm font-semibold text-[var(--ink)]">No talks match these filters.</p>
          </div>
        ) : null}
      </article>

      <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
          <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[var(--navy)]">
            <div className="relative aspect-video">
              {showTedEmbed && activeMaterial.embedUrl ? (
                <iframe
                  key={activeMaterial.embedUrl}
                  src={activeMaterial.embedUrl}
                  title={activeMaterial.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]">
                  {activeThumbnail ? (
                    <TedThumbnail src={activeThumbnail} alt={activeMaterial.title} />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,17,28,0.82)] via-[rgba(8,17,28,0.24)] to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h4 className="text-xl font-semibold tracking-tight text-white">
                      {activeMaterial.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {activeMaterial.speakerName} 路 {activeMaterial.durationLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {activeMaterial.notePrompts.map((prompt, index) => (
              <div
                key={prompt}
                className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Prompt {index + 1}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{prompt}</p>
              </div>
            ))}
          </div>

          <label className="mt-5 grid gap-2 text-sm font-medium text-[var(--ink)]">
            Listening notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={8}
              placeholder="Write the main claim, one key detail, and the technical words you want to remember."
              className="min-h-44 rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] px-4 py-3 text-sm leading-7 outline-none"
            />
          </label>

          <p className="mt-2 text-xs font-medium text-[var(--ink-soft)]">
            {noteWordCount} words in notes
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {activeMaterial.vocabulary.map((item) => (
              <article
                key={item.term}
                className="rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] p-4"
              >
                <p className="text-sm font-semibold text-[var(--ink)]">{item.term}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.definition}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <SaveToDeckButton
              items={activeMaterial.vocabulary.map((item) => ({
                front: item.term,
                back: item.definition,
              }))}
              tag={`ted-listening:${activeMaterial.majorId}`}
            />
          </div>
        </article>

        <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--ink)]">
              <CheckCircle2 className="mr-1.5 inline size-4" />
              Listening check
            </p>
            <p className="text-sm font-semibold text-[var(--ink-soft)]">
              {answeredCount}/{activeMaterial.questions.length} 路 {getDifficultyLabel(defaultLevel)}
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            {activeMaterial.questions.map((question, index) => (
              <label
                key={question.id}
                className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] p-4"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Q{index + 1}
                </span>
                <span className="mt-3 block text-sm font-semibold leading-6 text-[var(--ink)]">
                  {question.prompt}
                </span>
                <textarea
                  value={answers[question.id] ?? ""}
                  onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                  rows={3}
                  placeholder={question.placeholder}
                  className="mt-3 w-full rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-white px-4 py-3 text-sm leading-7 outline-none"
                />
              </label>
            ))}

            {submitStatus ? (
              <p className="rounded-[1rem] border border-[#e0b48a] bg-[#fff4eb] px-4 py-3 text-sm text-[#7a4517]">
                {submitStatus}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isScoring}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:opacity-60"
              >
                {isScoring ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {result ? "Re-check answers" : "Check answers"}
              </button>
            </div>
          </form>

          {result ? (
            <div
              className={cn(
                "mt-5 rounded-[1.4rem] border p-5",
                result.passed
                  ? "border-[#6a9483]/35 bg-[#edf6f1]"
                  : "border-[#e6c59a] bg-[#fff6ec]",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    Result
                  </p>
                  <h4 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ink)]">
                    {result.overallScore}/10
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    {result.correctCount} of {result.totalQuestions} answers matched the listening
                    checkpoints.
                  </p>
                </div>

                <span
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold",
                    result.passed
                      ? "bg-[#315f4f] text-white"
                      : "bg-[#8d5a21] text-white",
                  )}
                >
                  {result.passed ? "Ready for another talk" : "Review and try again"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[1.1rem] border border-white/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Strengths
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink)]">
                    {result.strengths.join(" ")}
                  </p>
                </div>

                <div className="rounded-[1.1rem] border border-white/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Revision focus
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink)]">
                    {result.revisionFocus}
                  </p>
                </div>

                <div className="rounded-[1.1rem] border border-white/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Next action
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{result.nextAction}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {result.questionFeedback.map((feedback) => (
                  <article
                    key={feedback.id}
                    className="rounded-[1.1rem] border border-white/60 bg-white/76 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-6 text-[var(--ink)]">
                        {feedback.prompt}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          feedback.correct
                            ? "bg-[#edf6f1] text-[#315f4f]"
                            : "bg-[#fff1e1] text-[#8d5a21]",
                        )}
                      >
                        {feedback.correct ? "Matched" : "Review"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                      Your answer: {feedback.answer || "No answer provided."}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
                      Model answer: {feedback.modelAnswer}
                    </p>
                  </article>
                ))}
              </div>

              {/* AI feedback button 鈥?appears after local scoring */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onAIFeedback}
                  disabled={isAIScoring}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:opacity-60"
                >
                  {isAIScoring ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {isAIScoring ? "AI analysing..." : "Get AI feedback"}
                </button>
              </div>
            </div>
          ) : null}

          {aiStatus ? (
            <p className="mt-4 rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
              {aiStatus}
            </p>
          ) : null}

          {isAIScoring ? (
            <div className="mt-5">
              <AIAnalysisState
                title="Evaluating your listening comprehension."
                description="The listening coach is checking your answers against the TED talk's argument structure, then preparing personalised feedback and tips."
                steps={[
                  "Reviewing your main argument and key detail answers.",
                  "Checking signpost identification and technical term choice.",
                  "Preparing a listening score with targeted coaching advice.",
                ]}
              />
            </div>
          ) : null}

          {aiFeedback ? (
            <div className="mt-5 grid gap-4 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br from-[#f7ead2] via-white to-[#fdf5e8] p-5">
              <div className="flex items-center gap-3 text-[var(--ink)]">
                <BookMarked className="size-4" />
                <p className="text-sm font-semibold">AI Listening Feedback</p>
              </div>

              <div className="rounded-[1.2rem] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Listening score
                </p>
                <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">
                  {aiFeedback.listening_score}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.2rem] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Main argument</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{aiFeedback.gist_feedback}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Key detail</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{aiFeedback.detail_feedback}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Structure / Signpost</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{aiFeedback.signpost_feedback}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Technical term</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{aiFeedback.term_feedback}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Notes quality</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{aiFeedback.note_feedback}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-semibold text-[var(--ink)]">Coach tips</p>
                {(Array.isArray(aiFeedback.tips) ? aiFeedback.tips : [String(aiFeedback.tips)]).map((tip) => (
                  <div key={tip} className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </section>

      <ContextDock
        key={`listening:${discussionContext.targetId}`}
        locale={locale}
        context={discussionContext}
      />
    </section>
  );
}
