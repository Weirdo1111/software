"use client";

import Image from "next/image";
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

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
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
import { cn } from "@/lib/utils";
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

function getSpeakerInitials(name?: string) {
  if (!name) return "TED";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ListeningFeedbackForm({
  defaultLevel = "B1",
  materials,
}: {
  defaultLevel?: CEFRLevel;
  materials?: ListeningMaterial[];
}) {
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
  const activeMajor = listeningMajors.find((major) => major.id === activeMaterial.majorId);
  const activeThumbnail = getMaterialThumbnail(activeMaterial);
  const completedTedCount = tedCatalog.filter((material) =>
    completionMap.has(material.materialGroupId),
  ).length;
  const answeredCount = activeMaterial.questions.filter(
    (question) => (answers[question.id] ?? "").trim().length >= 2,
  ).length;
  const noteWordCount = countWords(notes);

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
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="section-label">
              <PlayCircle className="size-3.5" /> TED Video Feed
            </p>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
              Browse by cover first, then study with the talk you choose.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
              This listening page now behaves more like a video platform home feed. Students can
              scan covers and titles quickly, filter by major or level, and then enter the study
              view for the selected TED talk.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {tedCatalog.length} TED talks
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {completedTedCount} completed
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              5 DIICSU majors
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
            <span className="sr-only">Level</span>
            <select
              value={selectedLevelFilter}
              onChange={(event) => setSelectedLevelFilter(event.target.value as LevelFilter)}
              className="rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] px-4 py-3 text-sm outline-none"
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level === "all" ? "All levels" : `Level ${level}`}
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
            <p className="section-label">Selected talk</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              {activeMaterial.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {activeMaterial.speakerName
                ? `${activeMaterial.speakerName} · ${activeMaterial.speakerRole}`
                : activeMaterial.speakerRole}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {activeMaterial.majorLabel}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {activeMaterial.durationLabel}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              Level {activeMaterial.recommendedLevel}
            </span>
            {activeCompletion ? (
              <span className="rounded-full border border-[#6a9483]/35 bg-[#edf6f1] px-3 py-1.5 text-[#315f4f]">
                Best {activeCompletion.bestScore}/10
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <div className="relative aspect-video overflow-hidden rounded-[1.3rem] bg-[rgba(20,50,75,0.08)]">
            {activeThumbnail ? (
              <Image
                src={activeThumbnail}
                alt={`${activeMaterial.title} cover`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,18,31,0.78)] to-transparent" />
            <div className="absolute bottom-3 right-3 rounded bg-[rgba(12,22,35,0.88)] px-2 py-1 text-[11px] font-semibold text-white">
              {activeMaterial.durationLabel.replace(" TED Talk", "")}
            </div>
          </div>

          <div>
            <p className="text-sm leading-7 text-[var(--ink)]">{activeMaterial.scenario}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {activeMaterial.supportFocus}
            </p>

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

            <div className="mt-5 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Why this talk fits {activeMajor?.shortLabel ?? "DIICSU"}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                {activeMajor?.focus ?? activeMaterial.majorLabel}
              </p>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Video library</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Scan the feed and choose what to watch next.
            </h3>
          </div>

          <div className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">
            {filteredMaterials.length} results
          </div>
        </div>

        <div className="mt-6 grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
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
                  <div className="relative aspect-video overflow-hidden rounded-[1rem] bg-[rgba(20,50,75,0.08)]">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={`${material.title} cover`}
                        fill
                        sizes="(max-width: 1280px) 100vw, 420px"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,18,32,0.76)] to-transparent" />
                    <div className="absolute left-3 top-3 rounded bg-[#eb0028] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                      TED
                    </div>
                    <div className="absolute bottom-3 right-3 rounded bg-[rgba(12,22,35,0.88)] px-2 py-1 text-[11px] font-semibold text-white">
                      {material.durationLabel.replace(" TED Talk", "")}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-3">
                    <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(20,50,75,0.08)] text-xs font-semibold text-[var(--ink)]">
                      {getSpeakerInitials(material.speakerName)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="min-h-[3.4rem] text-sm font-semibold leading-6 text-[var(--ink)]">
                        {material.title}
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                        {material.speakerName}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-[var(--ink-soft)]">
                        {material.majorLabel} · Level {material.recommendedLevel}
                      </p>
                      {completion ? (
                        <p className="mt-1 text-xs font-semibold text-[#315f4f]">
                          Best score {completion.bestScore}/10
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </button>
            );
          })}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="mt-5 rounded-[1.2rem] border border-dashed border-[rgba(20,50,75,0.16)] bg-[rgba(247,250,252,0.72)] p-6 text-center">
            <p className="text-sm font-semibold text-[var(--ink)]">No talks match these filters.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Try another keyword, level, or major.
            </p>
          </div>
        ) : null}
      </article>

      <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
          <p className="section-label">
            <PlayCircle className="size-3.5" /> Watch and note
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Turn the selected TED talk into a focused listening task.
          </h3>

          <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[var(--navy)]">
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
                <>
                  {activeThumbnail ? (
                    <Image
                      src={activeThumbnail}
                      alt={`${activeMaterial.title} preview`}
                      fill
                      sizes="(max-width: 1280px) 100vw, 720px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,17,28,0.82)] via-[rgba(8,17,28,0.24)] to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h4 className="text-xl font-semibold tracking-tight text-white">
                      {activeMaterial.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {activeMaterial.speakerName} · {activeMaterial.durationLabel}
                    </p>
                  </div>
                </>
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-label">
                <CheckCircle2 className="size-3.5" /> Listening check
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--ink)]">
                Answer after watching, not before.
              </h3>
            </div>

            <div className="rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Progress
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {answeredCount}/{activeMaterial.questions.length}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Target level {defaultLevel}</p>
            </div>
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

              {/* AI feedback button — appears after local scoring */}
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
    </section>
  );
}
