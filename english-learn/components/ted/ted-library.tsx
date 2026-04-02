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
  type DIICSUMajorId,
  type ListeningAccent,
  type ListeningMaterial,
  type ListeningResourceType,
  type ListeningSourceProviderId,
} from "@/lib/listening-materials";
import {
  getListeningLibraryServerSnapshot,
  getListeningLibrarySnapshot,
  subscribeListeningLibrary,
} from "@/lib/listening-library";
import { type Locale } from "@/lib/i18n/dictionaries";
import { getDifficultyLabel, type DifficultyLabel } from "@/lib/level-labels";
import { cn } from "@/lib/utils";

type ExtendedMajorFilter = "all" | DIICSUMajorId | "cross";
type DifficultyFilter = "all" | DifficultyLabel;
type AccentFilter = "all" | ListeningAccent;

interface CrossMajorPair {
  primaryId: DIICSUMajorId;
  secondaryId: DIICSUMajorId;
}

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

const majorZhLabelMap: Record<DIICSUMajorId, string> = {
  "civil-engineering": "土木工程",
  mathematics: "应用数学",
  "computing-science": "计算机科学",
  "mechanical-engineering": "机械工程",
  "mechanical-engineering-transportation": "机械工程（交通设备）",
};

const crossMajorFallbackMap: Record<DIICSUMajorId, DIICSUMajorId> = {
  "civil-engineering": "computing-science",
  mathematics: "computing-science",
  "computing-science": "mathematics",
  "mechanical-engineering": "computing-science",
  "mechanical-engineering-transportation": "computing-science",
};

const majorKeywordMap: Record<DIICSUMajorId, string[]> = {
  "civil-engineering": [
    "civil",
    "infrastructure",
    "building",
    "city",
    "coast",
    "flood",
    "urban",
    "bridge",
  ],
  mathematics: [
    "math",
    "mathematics",
    "statistic",
    "probability",
    "model",
    "quantitative",
    "equation",
  ],
  "computing-science": [
    "ai",
    "algorithm",
    "code",
    "software",
    "compute",
    "data",
    "machine learning",
    "model",
    "digital",
  ],
  "mechanical-engineering": [
    "mechanical",
    "robot",
    "thermal",
    "manufacturing",
    "materials",
    "hardware",
    "fabrication",
  ],
  "mechanical-engineering-transportation": [
    "transport",
    "mobility",
    "vehicle",
    "aviation",
    "rail",
    "traffic",
    "transit",
  ],
};

function getMajorDisplayLabel(majorId: DIICSUMajorId, locale: Locale) {
  if (locale === "zh") {
    return majorZhLabelMap[majorId];
  }

  return listeningMajors.find((major) => major.id === majorId)?.label ?? majorId;
}

function inferCrossSecondaryMajorId(material: ListeningMaterial): DIICSUMajorId {
  const searchText = normalizeSearchValue(
    [
      material.title,
      material.scenario,
      material.supportFocus,
      material.sourceName,
      material.speakerRole,
      material.transcript,
    ].join(" "),
  );

  let bestMajor: DIICSUMajorId | null = null;
  let bestScore = 0;

  listeningMajors.forEach((major) => {
    if (major.id === material.majorId) return;

    const score = majorKeywordMap[major.id].reduce(
      (sum, keyword) => sum + (searchText.includes(keyword) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestMajor = major.id;
      bestScore = score;
    }
  });

  return bestMajor ?? crossMajorFallbackMap[material.majorId];
}

function getCrossMajorPair(material: ListeningMaterial): CrossMajorPair | null {
  if (!material.isCrossDisciplinary) return null;

  const secondaryId = inferCrossSecondaryMajorId(material);

  return {
    primaryId: material.majorId,
    secondaryId,
  };
}

function getCrossMajorFilterLabel(pair: CrossMajorPair, locale: Locale) {
  const primaryLabel = getMajorDisplayLabel(pair.primaryId, locale);
  const secondaryLabel = getMajorDisplayLabel(pair.secondaryId, locale);

  return locale === "zh"
    ? `跨学科：${primaryLabel} × ${secondaryLabel}`
    : `Cross: ${primaryLabel} × ${secondaryLabel}`;
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
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<ExtendedMajorFilter>("all");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<DifficultyFilter>("all");
  const [selectedAccentFilter, setSelectedAccentFilter] = useState<AccentFilter>("all");

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

  const availableAccents = useMemo(() => {
    const accentSet = new Set(catalog.map((material) => material.accent));
    return listeningAccents.filter((accent) => accentSet.has(accent.id));
  }, [catalog]);

  const crossPairByGroupId = useMemo(
    () =>
      new Map(
        catalog.map((material) => [material.materialGroupId, getCrossMajorPair(material)]),
      ),
    [catalog],
  );

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(deferredSearchValue);

    return catalog.filter((material) => {
      const matchesMajor =
        selectedMajorFilter === "all"
          ? true
          : selectedMajorFilter === "cross"
            ? material.isCrossDisciplinary === true
            : material.majorId === selectedMajorFilter;
      const matchesDifficulty =
        selectedDifficultyFilter === "all" ||
        getDifficultyLabel(material.recommendedLevel) === selectedDifficultyFilter;
      const matchesAccent =
        selectedAccentFilter === "all" || material.accent === selectedAccentFilter;
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
        matchesAccent &&
        matchesSearch
      );
    });
  }, [
    catalog,
    deferredSearchValue,
    selectedAccentFilter,
    selectedDifficultyFilter,
    selectedMajorFilter,
  ]);

  return (
    <section className="grid gap-5">
      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">
              {locale === "zh" ? "工科学术听力库" : "Academic Listening Library"}
            </h2>
          </div>
          <LanguageSwitcher locale={locale} />
        </div>

        <div className="mt-5">
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
              {getMajorDisplayLabel(major.id, locale)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedMajorFilter("cross")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              selectedMajorFilter === "cross"
                ? "bg-[var(--navy)] text-[#f7efe3]"
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

        <div className="mt-3 flex flex-wrap gap-2">
          {difficultyOptions.map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              onClick={() => setSelectedDifficultyFilter(difficulty)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                selectedDifficultyFilter === difficulty
                  ? "bg-[var(--navy)] text-[#f7efe3]"
                  : "border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] text-[var(--ink)]",
              )}
            >
              {difficulty === "all"
                ? locale === "zh"
                  ? "全部难度"
                  : "All difficulties"
                : difficulty}
            </button>
          ))}
        </div>
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
            const crossMajorPair = crossPairByGroupId.get(material.materialGroupId) ?? null;

            return (
              <Link
                key={material.materialGroupId}
                href={`/listening/${material.materialGroupId}?lang=${locale}`}
                className="group block h-full text-left"
              >
                <article
                  className={cn(
                    "h-full overflow-hidden rounded-[1.35rem] border bg-white shadow-[0_10px_28px_rgba(19,32,52,0.05)] transition-all",
                    "border-[rgba(20,50,75,0.08)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(19,32,52,0.08)]",
                    "flex flex-col",
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

                  <div className="flex min-h-0 flex-1 flex-col p-4">
                    <div className="flex min-h-[3.75rem] flex-wrap content-start gap-2 text-[11px] font-semibold text-[var(--ink-soft)]">
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
                          {crossMajorPair
                            ? getCrossMajorFilterLabel(crossMajorPair, locale)
                            : locale === "zh"
                              ? "跨学科"
                              : "Cross-disciplinary"}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {material.scenario}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
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
