"use client";

import {
  CheckCircle2,
  Search,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";
import {
  useDeferredValue,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  listeningMajors,
  listeningMaterials,
  speakerRegions,
  tedListeningMaterials,
  type DIICSUMajorId,
  type ListeningMaterial,
  type SpeakerRegion,
} from "@/lib/listening-materials";
import {
  getListeningLibraryServerSnapshot,
  getListeningLibrarySnapshot,
  subscribeListeningLibrary,
} from "@/lib/listening-library";
import { getDifficultyLabel } from "@/lib/level-labels";
import { cn } from "@/lib/utils";
import type { CEFRLevel } from "@/types/learning";

type MajorFilter = "all" | DIICSUMajorId;
type LevelFilter = "all" | CEFRLevel;
type RegionFilter = "all" | SpeakerRegion;

const tedThumbnailFallbackMap = new Map(
  tedListeningMaterials.map((material) => [material.materialGroupId, material.thumbnailUrl]),
);

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getMaterialThumbnail(material: ListeningMaterial) {
  return material.thumbnailUrl ?? tedThumbnailFallbackMap.get(material.materialGroupId) ?? null;
}

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

import { type Locale } from "@/lib/i18n/dictionaries";

export function TedLibrary({
  materials,
  locale,
}: {
  materials?: ListeningMaterial[];
  locale: Locale;
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

  const completedTedCount = tedCatalog.filter((material) =>
    completionMap.has(material.materialGroupId),
  ).length;

  return (
    <section className="grid gap-5">
      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">
            TED Listening
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {tedCatalog.length} talks
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {completedTedCount} done
            </span>
            <LanguageSwitcher locale={locale} />
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
        <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => {
            const thumbnail = getMaterialThumbnail(material);
            const completion = completionMap.get(material.materialGroupId);

            return (
              <Link
                key={material.materialGroupId}
                href={`/listening/ted/${material.materialGroupId}?lang=${locale}`}
                className="group text-left"
              >
                <article
                  className={cn(
                    "rounded-[1.35rem] border bg-white p-2.5 shadow-[0_10px_28px_rgba(19,32,52,0.05)] transition-all",
                    "border-[rgba(20,50,75,0.08)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(19,32,52,0.08)]",
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
                      {material.speakerName} · {material.majorLabel} · {getDifficultyLabel(material.recommendedLevel)}
                    </p>
                    {completion ? (
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#315f4f]">
                        <CheckCircle2 className="size-3" />
                        Best {completion.bestScore}/10
                      </p>
                    ) : null}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="rounded-[1.2rem] border border-dashed border-[rgba(20,50,75,0.16)] bg-[rgba(247,250,252,0.72)] p-6 text-center">
            <p className="text-sm font-semibold text-[var(--ink)]">No talks match these filters.</p>
          </div>
        ) : null}
      </article>
    </section>
  );
}
