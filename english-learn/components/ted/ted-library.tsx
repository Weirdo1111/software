"use client";

import { CheckCircle2, PlayCircle, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState, useSyncExternalStore } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import {
  buildListeningCoverDataUrl,
  buildMediaProxyUrl,
  getListeningPlaybackMode,
  getListeningSourceProvider,
  hasTranscriptStudySupport,
  hasStableInlinePreview,
  listeningAccents,
  shouldPreferGeneratedCover,
  listeningMajors,
  listeningMaterials,
  listeningPlaybackModes,
  listeningSourceProviders,
  speakerRegions,
  type DIICSUMajorId,
  type ListeningAccent,
  type ListeningMaterial,
  type ListeningResourceType,
  type ListeningSourceProviderId,
  type SpeakerRegion,
} from "@/lib/listening-materials";
import {
  getListeningLibraryServerSnapshot,
  getListeningLibrarySnapshot,
  subscribeListeningLibrary,
} from "@/lib/listening-library";
import { type Locale } from "@/lib/i18n/dictionaries";
import { getDifficultyLabel, type DifficultyLabel } from "@/lib/level-labels";
import { cn } from "@/lib/utils";

type MajorFilter = "all" | DIICSUMajorId;
type DifficultyFilter = "all" | DifficultyLabel;
type RegionFilter = "all" | SpeakerRegion;
type AccentFilter = "all" | ListeningAccent;
type ResourceFilter = "all" | ListeningResourceType;
type SourceFilter = "all" | ListeningSourceProviderId;
type InterdisciplinaryFilter = "all" | "cross";

const resourceTypeMeta: Record<ListeningResourceType, { label: string; shortLabel: string }> = {
  "real-talk": { label: "Real Talk", shortLabel: "Talk" },
  lecture: { label: "Public Lecture", shortLabel: "Lecture" },
  interview: { label: "Expert Interview", shortLabel: "Interview" },
  podcast: { label: "Podcast", shortLabel: "Podcast" },
};

const coverToneByMajor: Record<DIICSUMajorId, string> = {
  "civil-engineering": "from-[#17354d] via-[#224c6c] to-[#326d83]",
  mathematics: "from-[#2b2a52] via-[#45406b] to-[#6379a1]",
  "computing-science": "from-[#0f2e3c] via-[#16546a] to-[#2d7a8b]",
  "mechanical-engineering": "from-[#4a2b1c] via-[#7a4530] to-[#b66a43]",
  "mechanical-engineering-transportation": "from-[#18342d] via-[#25534c] to-[#3c8573]",
};

const fallbackThumbnailMap = new Map(
  listeningMaterials.map((material) => [material.materialGroupId, material.thumbnailUrl]),
);

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getSourceProviderMeta(sourceProviderId: ListeningSourceProviderId) {
  return (
    listeningSourceProviders.find((provider) => provider.id === sourceProviderId) ??
    listeningSourceProviders[0]
  );
}

function getPlaybackModeMeta(playbackModeId: ReturnType<typeof getListeningPlaybackMode>) {
  if (!playbackModeId) return null;

  return (
    listeningPlaybackModes.find((mode) => mode.id === playbackModeId) ?? listeningPlaybackModes[0]
  );
}

function normalizeThumbnailUrl(url?: string | null) {
  if (typeof url !== "string") return null;

  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getYouTubeThumbnailFromUrl(url?: string) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname.includes("youtube.com")) {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = segments.findIndex((segment) => segment === "embed");
      const videoId =
        embedIndex >= 0
          ? segments[embedIndex + 1]
          : parsed.searchParams.get("v");

      return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
    }

    if (hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function getMaterialThumbnail(material: ListeningMaterial) {
  const generatedCover = buildListeningCoverDataUrl(material);

  if (shouldPreferGeneratedCover(material)) {
    return generatedCover;
  }

  const resolvedThumbnail =
    normalizeThumbnailUrl(material.thumbnailUrl) ??
    normalizeThumbnailUrl(fallbackThumbnailMap.get(material.materialGroupId)) ??
    getYouTubeThumbnailFromUrl(material.embedUrl) ??
    getYouTubeThumbnailFromUrl(material.officialUrl) ??
    generatedCover;

  return buildMediaProxyUrl(resolvedThumbnail) ?? generatedCover;
}

function isDataImageUrl(url?: string | null) {
  return typeof url === "string" && url.startsWith("data:image/");
}

function ListeningThumbnail({
  material,
  className,
}: {
  material: ListeningMaterial;
  className?: string;
}) {
  const src = getMaterialThumbnail(material);
  const [failed, setFailed] = useState(false);

  if (isDataImageUrl(src)) {
    return (
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 bg-cover bg-center bg-no-repeat", className)}
        style={{ backgroundImage: `url("${src}")` }}
      />
    );
  }

  if (!src || failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden bg-gradient-to-br",
          coverToneByMajor[material.majorId],
          className,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_46%,rgba(255,255,255,0.08)_47%,rgba(255,255,255,0.08)_53%,transparent_54%,transparent_100%)]" />
        <div className="absolute -right-8 top-5 h-24 w-24 rounded-full bg-white/14 blur-2xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-black/18 blur-3xl" />
        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/18 px-3 py-1.5 text-[11px] font-semibold text-white/92 backdrop-blur-sm">
          <PlayCircle className="size-4" />
          DIICSU Listening
        </div>
      </div>
    );
  }

  /* eslint-disable @next/next/no-img-element */
  return (
    <img
      src={src}
      alt={material.title}
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
  /* eslint-enable @next/next/no-img-element */
}

export function TedLibrary({
  materials,
  locale,
}: {
  materials?: ListeningMaterial[];
  locale: Locale;
}) {
  const catalog = useMemo(() => {
    const source = materials && materials.length > 0 ? materials : listeningMaterials;
    const seenGroupIds = new Set<string>();

    return source
      .filter((material) => material.contentMode !== "practice")
      .filter((material) => {
        const groupKey = material.materialGroupId.trim().toLowerCase();

        if (seenGroupIds.has(groupKey)) {
          return false;
        }

        seenGroupIds.add(groupKey);
        return true;
      })
      .sort(
      (left, right) =>
        left.majorLabel.localeCompare(right.majorLabel) ||
        left.resourceType.localeCompare(right.resourceType) ||
        left.title.localeCompare(right.title),
      );
  }, [materials]);

  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<MajorFilter>("all");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<DifficultyFilter>("all");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<RegionFilter>("all");
  const [selectedAccentFilter, setSelectedAccentFilter] = useState<AccentFilter>("all");
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<ResourceFilter>("all");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<SourceFilter>("all");
  const [selectedInterdisciplinaryFilter, setSelectedInterdisciplinaryFilter] =
    useState<InterdisciplinaryFilter>("all");

  const librarySnapshot = useSyncExternalStore(
    subscribeListeningLibrary,
    getListeningLibrarySnapshot,
    getListeningLibraryServerSnapshot,
  );

  const completionMap = useMemo(
    () => new Map(librarySnapshot.completions.map((entry) => [entry.groupId, entry])),
    [librarySnapshot.completions],
  );

  const difficultyOptions = useMemo(() => {
    const difficulties = Array.from(
      new Set(catalog.map((material) => getDifficultyLabel(material.recommendedLevel))),
    );
    return (["all", ...difficulties] as DifficultyFilter[]).sort((left, right) => {
      const order: Record<DifficultyFilter, number> = { all: -1, Easy: 0, Medium: 1, Difficult: 2 };
      return order[left] - order[right];
    });
  }, [catalog]);

  const availableRegions = useMemo(() => {
    const regionSet = new Set(catalog.map((material) => material.speakerRegion).filter(Boolean));
    return speakerRegions.filter((region) => regionSet.has(region.id));
  }, [catalog]);

  const availableResources = useMemo(() => {
    const typeSet = new Set(catalog.map((material) => material.resourceType));
    return (Object.keys(resourceTypeMeta) as ListeningResourceType[]).filter((type) =>
      typeSet.has(type),
    );
  }, [catalog]);

  const availableSourceProviders = useMemo(() => {
    const providerSet = new Set(catalog.map((material) => getListeningSourceProvider(material)));
    return listeningSourceProviders
      .filter((provider) => providerSet.has(provider.id))
      .sort((left, right) => left.priority - right.priority || left.label.localeCompare(right.label));
  }, [catalog]);

  const availableAccents = useMemo(() => {
    const accentSet = new Set(catalog.map((material) => material.accent));
    return listeningAccents.filter((accent) => accentSet.has(accent.id));
  }, [catalog]);

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(deferredSearchValue);

    return catalog.filter((material) => {
      const matchesMajor =
        selectedMajorFilter === "all" || material.majorId === selectedMajorFilter;
      const matchesDifficulty =
        selectedDifficultyFilter === "all" ||
        getDifficultyLabel(material.recommendedLevel) === selectedDifficultyFilter;
      const matchesRegion =
        selectedRegionFilter === "all" || material.speakerRegion === selectedRegionFilter;
      const matchesAccent =
        selectedAccentFilter === "all" || material.accent === selectedAccentFilter;
      const matchesResource =
        selectedResourceFilter === "all" || material.resourceType === selectedResourceFilter;
      const matchesSource =
        selectedSourceFilter === "all" ||
        getListeningSourceProvider(material) === selectedSourceFilter;
      const matchesInterdisciplinary =
        selectedInterdisciplinaryFilter === "all" || material.isCrossDisciplinary === true;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeSearchValue(
          [
            material.title,
            material.materialGroupLabel,
            material.majorLabel,
            material.speakerName ?? "",
            material.speakerRole,
            material.sourceName,
            material.scenario,
            material.supportFocus,
          ].join(" "),
        ).includes(normalizedSearch);

      return (
        matchesMajor &&
        matchesDifficulty &&
        matchesRegion &&
        matchesAccent &&
        matchesResource &&
        matchesSource &&
        matchesInterdisciplinary &&
        matchesSearch
      );
    });
  }, [
    catalog,
    deferredSearchValue,
    selectedAccentFilter,
    selectedDifficultyFilter,
    selectedMajorFilter,
    selectedRegionFilter,
    selectedResourceFilter,
    selectedSourceFilter,
    selectedInterdisciplinaryFilter,
  ]);

  const crossDisciplinaryCount = catalog.filter(
    (material) => material.isCrossDisciplinary === true,
  ).length;
  const readableCount = catalog.filter((material) => hasTranscriptStudySupport(material)).length;
  const playableCount = catalog.filter(
    (material) =>
      hasStableInlinePreview(material) ||
      (typeof material.audioSrc === "string" && material.audioSrc.trim().length > 0),
  ).length;
  const sourceProviderCount = availableSourceProviders.length;
  const completedCount = catalog.filter((material) => completionMap.has(material.materialGroupId)).length;

  return (
    <section className="grid gap-5">
      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">
              {locale === "zh" ? "工科学术听力库" : "Academic Listening Library"}
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {locale === "zh"
                ? "按专业、来源机构、口音和难度筛选材料；支持站内播放，也支持先看文本再做题核对。"
                : "Filter by major, source provider, accent, and difficulty. Students can watch in-app or review the study text before checking answers."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {catalog.length} {locale === "zh" ? "条材料" : "items"}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {playableCount} {locale === "zh" ? "条站内可播" : "in-app playable"}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {readableCount} {locale === "zh" ? "条支持文本学习" : "with study text"}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {sourceProviderCount} {locale === "zh" ? "个官方来源" : "source providers"}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {crossDisciplinaryCount} {locale === "zh" ? "条跨学科" : "cross-disciplinary"}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {completedCount} {locale === "zh" ? "条已完成" : "done"}
            </span>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(135deg,rgba(235,244,255,0.82),rgba(247,250,252,0.9))] p-4 text-sm leading-6 text-[var(--ink-soft)]">
          <p>
            {locale === "zh"
              ? "训练逻辑：先按专业与难度选材料，再决定是直接听 / 看，还是结合文本做精听，最后完成 4 个核心问题并立即对答案。"
              : "Training flow: pick a major-specific item, decide whether to watch or read first, then complete the four core questions and check the answers right away."}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]/80">
            {locale === "zh"
              ? "优先材料线：官方教育频道 / MIT OCW / TED / NPTEL / 其他官方学术来源"
              : "Priority lanes: official education channels / MIT OCW / TED / NPTEL / other official academic sources"}
          </p>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_14rem]">
          <label className="block">
            <span className="sr-only">Search listening materials</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-soft)]" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={locale === "zh" ? "搜索标题、来源、主题、术语" : "Search title, source, topic, term"}
                className="w-full rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] py-3 pl-11 pr-4 text-sm outline-none"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            <span className="sr-only">Difficulty</span>
            <select
              value={selectedDifficultyFilter}
              onChange={(event) => setSelectedDifficultyFilter(event.target.value as DifficultyFilter)}
              className="rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] px-4 py-3 text-sm outline-none"
            >
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === "all"
                    ? locale === "zh"
                      ? "全部难度"
                      : "All difficulties"
                    : difficulty}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            <span className="sr-only">Resource type</span>
            <select
              value={selectedResourceFilter}
              onChange={(event) =>
                setSelectedResourceFilter(event.target.value as ResourceFilter)
              }
              className="rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] px-4 py-3 text-sm outline-none"
            >
              <option value="all">{locale === "zh" ? "全部材料形态" : "All formats"}</option>
              {availableResources.map((type) => (
                <option key={type} value={type}>
                  {resourceTypeMeta[type].label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            <span className="sr-only">Source provider</span>
            <select
              value={selectedSourceFilter}
              onChange={(event) => setSelectedSourceFilter(event.target.value as SourceFilter)}
              className="rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.9)] px-4 py-3 text-sm outline-none"
            >
              <option value="all">{locale === "zh" ? "全部来源机构" : "All providers"}</option>
              {availableSourceProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.label}
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
            {locale === "zh" ? "全部专业" : "All majors"}
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

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedInterdisciplinaryFilter("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              selectedInterdisciplinaryFilter === "all"
                ? "bg-[#6b4f2c] text-white"
                : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
            )}
          >
            {locale === "zh" ? "全部主题" : "All themes"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedInterdisciplinaryFilter("cross")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              selectedInterdisciplinaryFilter === "cross"
                ? "bg-[#6b4f2c] text-white"
                : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
            )}
          >
            {locale === "zh" ? "跨学科" : "Cross-disciplinary"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedAccentFilter("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              selectedAccentFilter === "all"
                ? "bg-[var(--coral)] text-white"
                : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
            )}
          >
            {locale === "zh" ? "全部口音" : "All accents"}
          </button>
          {availableAccents.map((accent) => (
            <button
              key={accent.id}
              type="button"
              onClick={() => setSelectedAccentFilter(accent.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                selectedAccentFilter === accent.id
                  ? "bg-[var(--coral)] text-white"
                  : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
              )}
            >
              {accent.label}
            </button>
          ))}
        </div>

        {availableRegions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedRegionFilter("all")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                selectedRegionFilter === "all"
                    ? "bg-[#315f4f] text-white"
                    : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
                )}
              >
                {locale === "zh" ? "全部地区" : "All regions"}
              </button>
              {availableRegions.map((region) => (
                <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegionFilter(region.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  selectedRegionFilter === region.id
                    ? "bg-[#315f4f] text-white"
                    : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
                )}
              >
                {region.label}
              </button>
            ))}
          </div>
        ) : null}
      </article>

      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => {
            const completion = completionMap.get(material.materialGroupId);
            const hasInlineVideo = hasStableInlinePreview(material);
            const hasInAppAudio =
              !hasInlineVideo &&
              typeof material.audioSrc === "string" &&
              material.audioSrc.length > 0;
            const sourceProvider = getSourceProviderMeta(getListeningSourceProvider(material));
            const playbackMode = getPlaybackModeMeta(getListeningPlaybackMode(material));
            const hasReadingMode = hasTranscriptStudySupport(material);

            return (
              <Link
                key={material.materialGroupId}
                href={`/listening/${material.materialGroupId}?lang=${locale}`}
                className="group text-left"
              >
                <article
                  className={cn(
                    "overflow-hidden rounded-[1.35rem] border bg-white shadow-[0_10px_28px_rgba(19,32,52,0.05)] transition-all",
                    "border-[rgba(20,50,75,0.08)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(19,32,52,0.08)]",
                  )}
                >
                  <div className="relative aspect-video overflow-hidden bg-[#10253c]">
                    <ListeningThumbnail
                      material={material}
                      className="transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,17,28,0.78)] via-[rgba(8,17,28,0.14)] to-transparent" />
                    <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                      <span className="rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/92 backdrop-blur-sm">
                        {sourceProvider.shortLabel}
                      </span>
                      <span className="rounded-full border border-white/18 bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                        {resourceTypeMeta[material.resourceType].shortLabel}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="line-clamp-2 text-lg font-semibold leading-6 tracking-tight text-white">
                        {material.title}
                      </p>
                      <p className="mt-1 text-sm text-white/76">
                        {material.speakerName
                          ? `${material.speakerName} · ${material.durationLabel}`
                          : material.durationLabel}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[var(--ink-soft)]">
                      <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-2.5 py-1">
                        {material.majorLabel}
                      </span>
                      <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-2.5 py-1">
                        {material.accentLabel}
                      </span>
                      <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-2.5 py-1">
                        {getDifficultyLabel(material.recommendedLevel)}
                      </span>
                      {playbackMode ? (
                        <span className="rounded-full border border-[rgba(35,95,79,0.16)] bg-[rgba(237,246,241,0.9)] px-2.5 py-1 text-[#315f4f]">
                          {playbackMode.shortLabel}
                        </span>
                      ) : null}
                      {material.isCrossDisciplinary ? (
                        <span className="rounded-full border border-[rgba(107,79,44,0.18)] bg-[rgba(247,239,227,0.92)] px-2.5 py-1 text-[#6b4f2c]">
                          {locale === "zh" ? "跨学科" : "Cross-disciplinary"}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {material.scenario}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {material.sourceName}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            hasInlineVideo || hasInAppAudio
                              ? "bg-[rgba(35,95,79,0.1)] text-[#315f4f]"
                              : "bg-[rgba(20,50,75,0.08)] text-[var(--ink-soft)]",
                          )}
                        >
                          {hasInlineVideo
                            ? locale === "zh"
                              ? "站内视频"
                              : "In-app video"
                            : hasInAppAudio
                              ? locale === "zh"
                                ? "站内音频"
                                : "In-app audio"
                            : locale === "zh"
                              ? "来源打开"
                              : "Open source"}
                        </span>
                        {hasReadingMode ? (
                          <span className="rounded-full bg-[rgba(28,78,149,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[var(--navy)]">
                            {locale === "zh" ? "可看文本后答题" : "Read + answer"}
                          </span>
                        ) : null}
                      </div>
                      {completion ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#edf6f1] px-3 py-1 text-xs font-semibold text-[#315f4f]">
                          <CheckCircle2 className="size-3.5" />
                          {locale === "zh" ? "已完成" : "Done"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-[rgba(20,50,75,0.14)] bg-[rgba(247,250,252,0.75)] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[var(--ink)]">
              {locale === "zh" ? "没有匹配到资源" : "No materials match these filters"}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              {locale === "zh"
                ? "可以清空搜索词，或切换专业、来源机构、口音和难度筛选。"
                : "Try clearing the search or adjusting the major, provider, accent, or difficulty filters."}
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}
