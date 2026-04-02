"use client";

import {
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  Mic,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { useShadowingPractice } from "@/components/forms/listening/use-shadowing-practice";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SaveToDeckButton } from "@/components/forms/save-to-deck-button";
import {
  buildListeningCoverDataUrl,
  buildMediaProxyUrl,
  getListeningPlaybackMode,
  getListeningSourceProvider,
  getListeningStudyText,
  hasTranscriptStudySupport,
  hasStableInlinePreview,
  listeningMaterials,
  listeningPlaybackModes,
  listeningSourceProviders,
  scoreListeningMaterial,
  shouldPreferGeneratedCover,
  type ListeningMaterial,
} from "@/lib/listening-materials";
import {
  recordListeningCompletionInStorage,
  recordListeningHistoryInStorage,
} from "@/lib/listening-library";
import { recordSkillAttemptInStorage } from "@/lib/learning-tracker";
import { getDifficultyLabel } from "@/lib/level-labels";
import { cn } from "@/lib/utils";
import type { CEFRLevel, ListeningAIFeedback } from "@/types/learning";

const thumbnailFallbackMap = new Map(
  listeningMaterials.map((material) => [material.materialGroupId, material.thumbnailUrl]),
);

function buildAnswerState(questionIds: string[]) {
  return Object.fromEntries(questionIds.map((id) => [id, ""])) as Record<string, string>;
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeThumbnailUrl(url?: string | null) {
  if (typeof url !== "string") return null;

  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getMaterialThumbnail(material: ListeningMaterial) {
  const generatedCover = buildListeningCoverDataUrl(material);

  if (shouldPreferGeneratedCover(material)) {
    return generatedCover;
  }

  const resolvedThumbnail =
    normalizeThumbnailUrl(material.thumbnailUrl) ??
    normalizeThumbnailUrl(thumbnailFallbackMap.get(material.materialGroupId)) ??
    generatedCover;

  return buildMediaProxyUrl(resolvedThumbnail) ?? generatedCover;
}

function getSourceProviderMeta(material: ListeningMaterial) {
  const providerId = getListeningSourceProvider(material);
  return (
    listeningSourceProviders.find((provider) => provider.id === providerId) ??
    listeningSourceProviders[0]
  );
}

function getPlaybackModeMeta(material: ListeningMaterial) {
  const playbackModeId = getListeningPlaybackMode(material);

  if (!playbackModeId) return null;

  return (
    listeningPlaybackModes.find((playbackMode) => playbackMode.id === playbackModeId) ??
    listeningPlaybackModes[0]
  );
}

function isDataImageUrl(url?: string | null) {
  return typeof url === "string" && url.startsWith("data:image/");
}

function TedThumbnail({ src, alt, className }: { src: string; alt: string; className?: string }) {
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

function getSourceActionLabel(material: ListeningMaterial) {
  if (!material.officialUrl) return "Open source";
  if (material.officialUrl.includes("ted.com")) return "Watch on TED";
  if (material.officialUrl.includes("youtube.com") || material.officialUrl.includes("youtu.be")) {
    return "Watch on YouTube";
  }
  return "Open source page";
}

function getTranscriptActionLabel(material: ListeningMaterial) {
  if (!material.transcriptUrl) return "Source notes";
  if (material.transcriptUrl === material.officialUrl) return "Open transcript / source page";
  return "Transcript";
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

function buildPlayerPoster(material: ListeningMaterial) {
  const title = material.title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const source = material.sourceName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const major = material.majorLabel
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#1c4262" />
          <stop offset="55%" stop-color="#10253c" />
          <stop offset="100%" stop-color="#08131f" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)" />
      <circle cx="1120" cy="110" r="120" fill="#ffffff" fill-opacity="0.08" />
      <circle cx="160" cy="620" r="180" fill="#ffffff" fill-opacity="0.05" />
      <rect x="72" y="72" rx="28" ry="28" width="220" height="54" fill="#ffffff" fill-opacity="0.12" />
      <text x="104" y="107" font-size="28" font-family="Arial, sans-serif" fill="#f8fafc">${source}</text>
      <text x="72" y="510" font-size="58" font-weight="700" font-family="Arial, sans-serif" fill="#ffffff">${title}</text>
      <text x="72" y="576" font-size="28" font-family="Arial, sans-serif" fill="#ffffff" fill-opacity="0.78">${major}</text>
      <polygon points="610,300 610,430 730,365" fill="#ffffff" fill-opacity="0.92" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function isYouTubeHosted(material: ListeningMaterial) {
  return [material.embedUrl, material.officialUrl].some((url) => {
    if (!url) return false;

    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes("youtube.com") || hostname.includes("youtu.be");
    } catch {
      return false;
    }
  });
}

function getPreferredSpeechLocales(accent: ListeningMaterial["accent"]) {
  if (accent === "british") {
    return { primary: "en-GB", fallback: "en-US" };
  }

  if (accent === "indian") {
    return { primary: "en-IN", fallback: "en-US" };
  }

  return { primary: "en-US", fallback: "en-GB" };
}

export function TedDetail({
  material,
  defaultLevel = "B1",
  locale,
}: {
  material: ListeningMaterial;
  defaultLevel?: CEFRLevel;
  locale: string;
}) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<ReturnType<typeof scoreListeningMaterial> | null>(null);
  const [submitStatus, setSubmitStatus] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [attemptStartedAt] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => buildAnswerState(material.questions.map((question) => question.id)),
  );
  const [aiFeedback, setAiFeedback] = useState<ListeningAIFeedback | null>(null);
  const [isAIScoring, setIsAIScoring] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [preferIframe, setPreferIframe] = useState(false);
  const [forceAudioMode, setForceAudioMode] = useState(false);
  const [playerIssue, setPlayerIssue] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const recordedRef = useRef(false);
  const {
    isSupported: isVoiceInputSupported,
    status: voiceInputStatus,
    error: voiceInputError,
    startListening,
    stopListening,
    resetListening,
  } = useShadowingPractice();
  const canPreviewInline = hasStableInlinePreview(material);
  const hasAudioTrack = typeof material.audioSrc === "string" && material.audioSrc.length > 0;
  const hasInAppAudio = hasAudioTrack && (forceAudioMode || !canPreviewInline);
  const isSourceVideoBlocked =
    hasInAppAudio &&
    [material.embedUrl, material.officialUrl].some((url) => {
      if (!url) return false;

      try {
        const hostname = new URL(url).hostname.toLowerCase();
        return hostname.includes("youtube.com") || hostname.includes("youtu.be");
      } catch {
        return false;
      }
    });
  const thumbnail =
    getMaterialThumbnail(material) ??
    getYouTubeThumbnailFromUrl(material.embedUrl) ??
    getYouTubeThumbnailFromUrl(material.officialUrl);
  const proxiedAudioSrc = buildMediaProxyUrl(material.audioSrc);
  const proxiedVideoSrc = buildMediaProxyUrl(material.videoSrc);
  const localPoster = buildPlayerPoster(material);
  const sourceProvider = getSourceProviderMeta(material);
  const playbackMode = getPlaybackModeMeta(material);
  const studyText = getListeningStudyText(material);
  const studyParagraphs = studyText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  const hasReadingMode = hasTranscriptStudySupport(material);
  const usesTranscriptSummary = material.transcript.trim().length === 0;
  const noteWordCount = countWords(notes);
  const answeredCount = material.questions.filter(
    (question) => (answers[question.id] ?? "").trim().length >= 2,
  ).length;
  const shouldShowIframe = !!material.embedUrl && (preferIframe || !material.videoSrc);
  const shouldShowVideo = !!material.videoSrc && !preferIframe;
  const isYouTubeOnly = isYouTubeHosted(material) && !material.videoSrc;
  const isZh = locale === "zh" || locale.startsWith("zh");
  const voiceInputCopy = isZh
    ? {
        input: "语音输入",
        stop: "停止录音",
        recording: "正在语音输入…",
        unsupported: "当前浏览器不支持语音输入，建议使用 Chrome 或 Edge。",
        errorPrefix: "语音输入异常：",
      }
    : {
        input: "Voice input",
        stop: "Stop recording",
        recording: "Recording to text...",
        unsupported: "Voice input is not available in this browser. Try Chrome or Edge.",
        errorPrefix: "Voice input error: ",
      };

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordListeningHistoryInStorage(material.materialGroupId);
  }, [material.materialGroupId]);

  useEffect(() => {
    setPreferIframe(false);
    setForceAudioMode(false);
    setPlayerIssue(null);
    setShowTranscript(false);
    setActiveVoiceField(null);
    resetListening();
  }, [material.materialGroupId, resetListening]);

  useEffect(() => {
    if (voiceInputStatus !== "listening" && activeVoiceField !== null) {
      setActiveVoiceField(null);
    }
  }, [activeVoiceField, voiceInputStatus]);

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function startVoiceInputForField(
    fieldId: string,
    initialText: string,
    onTranscriptChange: (transcript: string) => void,
  ) {
    const { primary, fallback } = getPreferredSpeechLocales(material.accent);

    if (voiceInputStatus === "listening") {
      resetListening();
    }

    setActiveVoiceField(fieldId);
    startListening(primary, {
      initialText,
      continuous: true,
      fallbackLocale: fallback,
      stopOnSilence: false,
      onTranscriptChange,
    });
  }

  function toggleVoiceInputForNotes() {
    const fieldId = "notes";

    if (voiceInputStatus === "listening" && activeVoiceField === fieldId) {
      stopListening();
      return;
    }

    startVoiceInputForField(fieldId, notes, setNotes);
  }

  function toggleVoiceInputForQuestion(questionId: string) {
    const fieldId = `question:${questionId}`;

    if (voiceInputStatus === "listening" && activeVoiceField === fieldId) {
      stopListening();
      return;
    }

    startVoiceInputForField(fieldId, answers[questionId] ?? "", (transcript) => {
      handleAnswerChange(questionId, transcript);
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (voiceInputStatus === "listening") {
      stopListening();
    }

    setIsScoring(true);
    setSubmitStatus("");

    try {
      const nextResult = scoreListeningMaterial(material, answers, notes, defaultLevel);
      setResult(nextResult);
      recordListeningCompletionInStorage(
        material.materialGroupId,
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
          exercise_id: `${material.id}:listening-check`,
          answer_payload: {
            major: material.majorLabel,
            mode: material.contentMode,
            accent: material.accentLabel,
            source: material.sourceName,
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
          talk_title: material.title,
          speaker_name: material.speakerName ?? "Unknown",
          scenario: material.scenario,
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
      {/* Back + title header */}
      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/listening?lang=${locale}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--navy)] transition hover:gap-3"
          >
            <ArrowLeft className="size-4" />
            Back to library
          </Link>
          <LanguageSwitcher locale={locale as import("@/lib/i18n/dictionaries").Locale} />
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">
              {material.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {material.speakerName
                ? `${material.speakerName} · ${material.durationLabel}`
                : material.durationLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {material.majorLabel}
            </span>
            <span className="rounded-full border border-[rgba(28,78,149,0.16)] bg-[rgba(235,244,255,0.9)] px-3 py-1.5 text-[var(--navy)]">
              {sourceProvider.label}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {material.accentLabel}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {getDifficultyLabel(material.recommendedLevel)}
            </span>
            {playbackMode ? (
              <span className="rounded-full border border-[rgba(35,95,79,0.16)] bg-[rgba(237,246,241,0.9)] px-3 py-1.5 text-[#315f4f]">
                {playbackMode.label}
              </span>
            ) : null}
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {material.sourceName}
            </span>
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              {material.questions.length} {locale === "zh" ? "题" : "questions"}
            </span>
            {material.isCrossDisciplinary ? (
              <span className="rounded-full border border-[rgba(107,79,44,0.18)] bg-[rgba(247,239,227,0.92)] px-3 py-1.5 text-[#6b4f2c]">
                Cross-disciplinary
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{material.scenario}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {canPreviewInline ? (
            <button
              type="button"
              onClick={() => {
                setShowEmbed((current) => !current);
                setPlayerIssue(null);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3]"
            >
              <PlayCircle className="size-4" />
              {showEmbed ? "Hide preview" : "Preview in player"}
            </button>
          ) : null}

          {material.officialUrl ? (
            <a
              href={material.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              <ExternalLink className="size-4" />
              {getSourceActionLabel(material)}
            </a>
          ) : null}

          {material.transcriptUrl && material.transcriptUrl !== material.officialUrl ? (
            <a
              href={material.transcriptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              <FileText className="size-4" />
              {getTranscriptActionLabel(material)}
            </a>
          ) : null}

          {hasReadingMode ? (
            <button
              type="button"
              onClick={() => setShowTranscript((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              <FileText className="size-4" />
              {showTranscript
                ? locale === "zh"
                  ? "隐藏学习文本"
                  : "Hide study text"
                : locale === "zh"
                  ? "查看学习文本"
                  : "Open study text"}
            </button>
          ) : null}

          {showEmbed && material.embedUrl && material.videoSrc ? (
            <button
              type="button"
              onClick={() => {
                setPreferIframe((current) => !current);
                setPlayerIssue(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              <PlayCircle className="size-4" />
              {preferIframe ? "Use video file" : "Use embed player"}
            </button>
          ) : null}

          {hasAudioTrack && !hasInAppAudio ? (
            <button
              type="button"
              onClick={() => {
                setForceAudioMode(true);
                setShowEmbed(false);
                setPlayerIssue(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,95,79,0.22)] bg-[rgba(237,246,241,0.9)] px-5 py-3 text-sm font-semibold text-[#315f4f]"
            >
              <PlayCircle className="size-4" />
              {locale === "zh" ? "切换到站内音频" : "Use in-app audio"}
            </button>
          ) : null}

          {hasInAppAudio && canPreviewInline ? (
            <button
              type="button"
              onClick={() => {
                setForceAudioMode(false);
                setPlayerIssue(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
            >
              <PlayCircle className="size-4" />
              {locale === "zh" ? "切回源视频播放器" : "Use source player"}
            </button>
          ) : null}
        </div>

        {material.embedUrl && !canPreviewInline ? (
          <p className="mt-4 rounded-[1rem] border border-[rgba(191,128,64,0.18)] bg-[rgba(247,239,227,0.68)] px-4 py-3 text-sm leading-6 text-[#6b4f2c]">
            {locale === "zh"
              ? "这个来源的内嵌播放器在当前网络环境下不稳定，所以主资源库里已隐藏该预览，只保留来源链接。"
              : "This source's inline player is unstable in the current network environment, so the main library hides its preview and keeps the source link only."}
          </p>
        ) : null}
      </article>

      {/* Video + Notes section */}
      <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
          {hasInAppAudio ? (
            <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(135deg,rgba(236,244,252,0.96),rgba(247,250,252,0.92))] p-4 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
                <div className="relative overflow-hidden rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-[var(--navy)]">
                  <div className="relative aspect-video">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]">
                      {thumbnail ? <TedThumbnail src={thumbnail} alt={material.title} /> : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,17,28,0.82)] via-[rgba(8,17,28,0.24)] to-transparent" />
                      <div className="absolute left-4 top-4">
                        <span className="inline-flex items-center rounded-full border border-white/16 bg-black/28 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/92 backdrop-blur-sm">
                          {locale === "zh" ? "站内音频" : "In-app audio"}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h4 className="text-xl font-semibold tracking-tight text-white">
                          {material.title}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-white/80">
                          {material.speakerName
                            ? `${material.speakerName} · ${material.durationLabel}`
                            : material.durationLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/86 p-4 shadow-[0_12px_28px_rgba(18,32,52,0.05)] sm:p-5">
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[var(--ink-soft)]">
                    <span className="rounded-full border border-[rgba(35,95,79,0.16)] bg-[rgba(237,246,241,0.92)] px-3 py-1 text-[#315f4f]">
                      {locale === "zh" ? "已切换为站内学习音频" : "Using in-app study audio"}
                    </span>
                    <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1">
                      {material.accentLabel}
                    </span>
                    <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1">
                      {sourceProvider.label}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                    {isSourceVideoBlocked
                      ? locale === "zh"
                        ? "这个来源的官方视频走的是 YouTube，在你当前网络里不稳定，所以这里直接提供站内音频播放器；封面和题目仍保留在同一页里。"
                        : "The official video for this item is hosted on YouTube and is unstable in the current network, so this page switches straight to an in-app audio player while keeping the cover and questions together."
                      : locale === "zh"
                        ? "这个条目当前优先使用站内音频，你可以边听边做题，原始来源链接仍然保留。"
                        : "This item currently prioritizes in-app audio so students can listen and answer in one place while the original source link remains available."}
                  </p>

                  <div className="mt-4 rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] p-4">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {locale === "zh" ? "站内音频播放" : "In-app audio playback"}
                    </p>
                    <audio
                      controls
                      preload="none"
                      className="mt-3 w-full"
                      src={proxiedAudioSrc ?? undefined}
                    >
                      {locale === "zh"
                        ? "当前浏览器不支持音频播放器。"
                        : "Your browser does not support the audio player."}
                    </audio>
                  </div>

                  <p className="mt-3 text-xs leading-6 text-[var(--ink-soft)]">
                    {locale === "zh"
                      ? "如果你还想看官方原视频，可以继续使用上方来源链接；但站内答题建议直接用这里的音频。"
                      : "You can still open the official source above if you want the original video, but the in-app exercises are designed to work with this audio player."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[var(--navy)]">
              <div className="relative aspect-video">
                {showEmbed && canPreviewInline ? (
                  shouldShowIframe ? (
                    <iframe
                      key={material.embedUrl}
                      src={material.embedUrl}
                      title={material.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : shouldShowVideo ? (
                    <video
                      key={proxiedVideoSrc}
                      controls
                      playsInline
                      preload="metadata"
                      poster={localPoster}
                      className="h-full w-full bg-black object-cover"
                      src={proxiedVideoSrc ?? undefined}
                      onError={() => {
                        if (material.embedUrl) {
                          setPreferIframe(true);
                          setPlayerIssue(
                            locale === "zh"
                              ? "直链视频加载失败，已切换到备用嵌入播放器。"
                              : "The direct video file failed to load, so the player switched to the embedded fallback.",
                          );
                          return;
                        }

                        if (hasAudioTrack) {
                          setForceAudioMode(true);
                          setShowEmbed(false);
                          setPlayerIssue(
                            locale === "zh"
                              ? "视频直链加载失败，已自动切换到站内音频。"
                              : "The direct video file failed to load, so playback switched to in-app audio.",
                          );
                          return;
                        }

                        setPlayerIssue(
                          locale === "zh"
                            ? "这个视频文件在当前网络环境下无法直接加载，请先使用下方来源链接打开原页。"
                            : "This video file could not load in the current network environment. Use the source link below as a fallback.",
                        );
                      }}
                    >
                      {locale === "zh"
                        ? "当前浏览器不支持视频播放器。"
                        : "Your browser does not support the video player."}
                    </video>
                  ) : null
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]">
                    {thumbnail ? <TedThumbnail src={thumbnail} alt={material.title} /> : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,17,28,0.82)] via-[rgba(8,17,28,0.24)] to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h4 className="text-xl font-semibold tracking-tight text-white">
                        {material.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-white/80">
                        {material.speakerName
                          ? `${material.speakerName} · ${material.durationLabel}`
                          : material.durationLabel}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showEmbed && isYouTubeOnly ? (
            <p className="mt-4 rounded-[1rem] border border-[rgba(191,128,64,0.18)] bg-[rgba(247,239,227,0.68)] px-4 py-3 text-sm leading-6 text-[#6b4f2c]">
              {locale === "zh"
                ? "这个条目当前只有 YouTube 播放源。如果播放器持续空白，通常是当前网络对 YouTube 访问不稳定，需要替换为非 YouTube 源才能保证站内播放。"
                : "This item currently only has a YouTube playback source. If the player stays blank, the current network is likely blocking YouTube and the material will need a non-YouTube source to guarantee in-app playback."}
            </p>
          ) : null}

          {playerIssue ? (
            <p className="mt-4 rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
              {playerIssue}
            </p>
          ) : null}

          {isSourceVideoBlocked && !hasInAppAudio ? (
            <p className="mt-4 rounded-[1rem] border border-[rgba(35,95,79,0.16)] bg-[rgba(237,246,241,0.88)] px-4 py-3 text-sm leading-6 text-[#315f4f]">
              {locale === "zh"
                ? "官方视频源当前是 YouTube，在你现在的网络里不稳定，所以这里改用站内学习音频播放；原始来源链接仍然保留。"
                : "The official source uses YouTube and is unstable in the current network, so this page falls back to in-app study audio while keeping the original source link."}
            </p>
          ) : null}

          {showTranscript && hasReadingMode ? (
            <div className="mt-4 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {locale === "zh" ? "学习文本" : "Study text"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                    {usesTranscriptSummary
                      ? locale === "zh"
                        ? "这是一段站内学习摘要，适合先读后做题；如需官方全文，请打开原始 transcript 页面。"
                        : "This in-app study brief helps students read before answering. Open the official transcript page when you need the full source text."
                      : locale === "zh"
                        ? "可先读这段文本再答题，也可以先听后用它复盘关键词。"
                        : "Students can read this text before answering, or use it after listening to review the key ideas."}
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(28,78,149,0.08)] px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                  {usesTranscriptSummary
                    ? locale === "zh"
                      ? "摘要模式"
                      : "Brief mode"
                    : locale === "zh"
                      ? "文本模式"
                      : "Text mode"}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {studyParagraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="rounded-[1rem] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink-soft)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {material.notePrompts.map((prompt, index) => (
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleVoiceInputForNotes}
                disabled={!isVoiceInputSupported}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45",
                  voiceInputStatus === "listening" && activeVoiceField === "notes"
                    ? "border border-[#e25d4b] bg-[#c74435] text-white"
                    : "border border-[rgba(20,50,75,0.14)] bg-white text-[var(--ink)]",
                )}
              >
                <Mic
                  className={cn(
                    "size-3.5",
                    voiceInputStatus === "listening" && activeVoiceField === "notes"
                      ? "animate-pulse text-white"
                      : "text-[var(--ink-soft)]",
                  )}
                />
                {voiceInputStatus === "listening" && activeVoiceField === "notes"
                  ? voiceInputCopy.stop
                  : voiceInputCopy.input}
              </button>
              {voiceInputStatus === "listening" && activeVoiceField === "notes" ? (
                <span className="text-xs font-semibold text-[var(--ink-soft)]">
                  {voiceInputCopy.recording}
                </span>
              ) : null}
            </div>
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
            {material.vocabulary.map((item) => (
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
              items={material.vocabulary.map((item) => ({
                front: item.term,
                back: item.definition,
              }))}
              tag={`listening:${material.majorId}`}
            />
          </div>
        </article>

        {/* Listening check */}
        <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--ink)]">
              <CheckCircle2 className="mr-1.5 inline size-4" />
              Listening check
            </p>
            <p className="text-sm font-semibold text-[var(--ink-soft)]">
              {answeredCount}/{material.questions.length} · {getDifficultyLabel(defaultLevel)}
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            {material.questions.map((question, index) => {
              const voiceFieldId = `question:${question.id}`;
              const isRecordingThisField =
                voiceInputStatus === "listening" && activeVoiceField === voiceFieldId;

              return (
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
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleVoiceInputForQuestion(question.id)}
                      disabled={!isVoiceInputSupported}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45",
                        isRecordingThisField
                          ? "border border-[#e25d4b] bg-[#c74435] text-white"
                          : "border border-[rgba(20,50,75,0.14)] bg-white text-[var(--ink)]",
                      )}
                    >
                      <Mic
                        className={cn(
                          "size-3.5",
                          isRecordingThisField ? "animate-pulse text-white" : "text-[var(--ink-soft)]",
                        )}
                      />
                      {isRecordingThisField ? voiceInputCopy.stop : voiceInputCopy.input}
                    </button>
                    {isRecordingThisField ? (
                      <span className="text-xs font-semibold text-[var(--ink-soft)]">
                        {voiceInputCopy.recording}
                      </span>
                    ) : null}
                  </div>
                  <textarea
                    value={answers[question.id] ?? ""}
                    onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                    rows={3}
                    placeholder={question.placeholder}
                    className="mt-3 w-full rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-white px-4 py-3 text-sm leading-7 outline-none"
                  />
                </label>
              );
            })}

            {submitStatus ? (
              <p className="rounded-[1rem] border border-[#e0b48a] bg-[#fff4eb] px-4 py-3 text-sm text-[#7a4517]">
                {submitStatus}
              </p>
            ) : null}
            {!isVoiceInputSupported ? (
              <p className="rounded-[1rem] border border-[#dbe4ef] bg-[#f6f9fd] px-4 py-3 text-sm text-[var(--ink-soft)]">
                {voiceInputCopy.unsupported}
              </p>
            ) : null}
            {voiceInputError ? (
              <p className="rounded-[1rem] border border-[#e0b48a] bg-[#fff4eb] px-4 py-3 text-sm text-[#7a4517]">
                {voiceInputCopy.errorPrefix}
                {voiceInputError}
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
        </article>
      </section>

      {/* Result — full width below the two-column layout */}
      {result ? (
        <article
          className={cn(
            "rounded-[2rem] border p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6",
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
              {result.passed ? "Ready for another item" : "Review and try again"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
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

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
        </article>
      ) : null}

      {/* AI feedback status & loading — full width */}
      {aiStatus ? (
        <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {aiStatus}
        </p>
      ) : null}

      {isAIScoring ? (
        <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
          <AIAnalysisState
            title="Evaluating your listening comprehension."
            description="The listening coach is checking your answers against the source's main argument, then preparing personalised feedback and tips."
            steps={[
              "Reviewing your main argument and key detail answers.",
              "Checking signpost identification and technical term choice.",
              "Preparing a listening score with targeted coaching advice.",
            ]}
          />
        </article>
      ) : null}

      {/* AI feedback — full width */}
      {aiFeedback ? (
        <article className="grid gap-4 rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br from-[#f7ead2] via-white to-[#fdf5e8] p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </article>
      ) : null}
    </section>
  );
}
