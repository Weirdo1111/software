"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Headphones,
  Pause,
  Play,
} from "lucide-react";

import { type Locale } from "@/lib/i18n/dictionaries";
import {
  type DIICSUMajorId,
  type ListeningMaterial,
  type ListeningMaterialOption,
  getListeningMaterial,
  getListeningMaterialOptions,
  listeningMajors,
  practiceListeningMaterials,
} from "@/lib/listening-materials";

/* ------------------------------------------------------------------ */
/*  Step type                                                          */
/* ------------------------------------------------------------------ */

type Step = "pick" | "listen";

/* ------------------------------------------------------------------ */
/*  i18n copy                                                          */
/* ------------------------------------------------------------------ */

function useCopy(locale: Locale) {
  return locale === "zh"
    ? {
        pickTitle: "听力训练",
        pickSubtitle: "选择专业和话题，开始轻松听力练习",
        pickMajorTitle: "你的专业",
        pickTopicTitle: "选择话题",
        start: "开始练习",
        back: "返回",
        listenTitle: "听力练习",
        scenario: "场景",
        speed: "速度",
        slow: "慢速",
        normal: "正常",
        showTranscript: "显示文本",
        hideTranscript: "隐藏文本",
        notes: "你的笔记",
        notesPlaceholder: "记下你听到的关键信息...",
        backToSelect: "重新选择",
      }
    : {
        pickTitle: "Listening Practice",
        pickSubtitle: "Pick your major and a topic to start a relaxed listening session",
        pickMajorTitle: "Your major",
        pickTopicTitle: "Choose a topic",
        start: "Start practice",
        back: "Back",
        listenTitle: "Listening practice",
        scenario: "Scenario",
        speed: "Speed",
        slow: "Slow",
        normal: "Normal",
        showTranscript: "Show transcript",
        hideTranscript: "Hide transcript",
        notes: "Your notes",
        notesPlaceholder: "Write down key information you hear...",
        backToSelect: "Back to selection",
      };
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AccentPractice({ locale }: { locale: Locale }) {
  const copy = useCopy(locale);

  const [step, setStep] = useState<Step>("pick");
  const [major, setMajor] = useState<DIICSUMajorId>("computing-science");
  const [topicId, setTopicId] = useState<string | undefined>(undefined);

  const topics = useMemo(() => getListeningMaterialOptions(practiceListeningMaterials, "practice", major), [major]);
  const material = useMemo(() => {
    try {
      return getListeningMaterial(major, "global", topicId);
    } catch {
      return null;
    }
  }, [major, topicId]);

  const goListen = useCallback(() => setStep("listen"), []);
  const reset = useCallback(() => setStep("pick"), []);

  if (step === "pick") {
    return (
      <PickStep
        copy={copy}
        major={major}
        topicId={topicId}
        topics={topics}
        onMajorChange={(m) => { setMajor(m); setTopicId(undefined); }}
        onTopicChange={setTopicId}
        onStart={goListen}
      />
    );
  }

  if (!material) return null;

  return <ListenStep copy={copy} material={material} onBack={reset} />;
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Pick major + topic                                        */
/* ------------------------------------------------------------------ */

function PickStep({
  copy,
  major,
  topicId,
  topics,
  onMajorChange,
  onTopicChange,
  onStart,
}: {
  copy: ReturnType<typeof useCopy>;
  major: DIICSUMajorId;
  topicId: string | undefined;
  topics: ListeningMaterialOption[];
  onMajorChange: (m: DIICSUMajorId) => void;
  onTopicChange: (id: string) => void;
  onStart: () => void;
}) {
  return (
    <section className="mx-auto max-w-3xl space-y-5 reveal-up">
      {/* Header */}
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">{copy.pickTitle}</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{copy.pickSubtitle}</p>
      </article>

      {/* Major selector */}
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.pickMajorTitle}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {listeningMajors.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onMajorChange(m.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                major === m.id
                  ? "bg-[var(--navy)] text-[#f7efe3] shadow-[0_8px_18px_rgba(28,78,149,0.25)]"
                  : "border border-[rgba(20,50,75,0.14)] bg-white/80 text-[var(--ink)] hover:bg-[rgba(20,50,75,0.06)]"
              }`}
            >
              {m.shortLabel}
            </button>
          ))}
        </div>
      </article>

      {/* Topic selector */}
      {topics.length > 0 && (
        <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{copy.pickTopicTitle}</h3>
          <div className="mt-3 grid gap-2">
            {topics.map((t) => {
              const selected = topicId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTopicChange(t.id)}
                  className={`rounded-[1.1rem] border p-4 text-left transition hover:translate-y-[-1px] ${
                    selected
                      ? "border-[var(--navy)]/30 bg-[rgba(235,244,255,0.7)] shadow-[0_10px_22px_rgba(28,78,149,0.1)]"
                      : "border-[rgba(20,50,75,0.1)] bg-white/70 hover:bg-white/90"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">{t.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{t.summary}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]/60">{t.durationLabel}</p>
                </button>
              );
            })}
          </div>
        </article>
      )}

      {/* Start button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-[#f7efe3] shadow-[0_12px_28px_rgba(28,78,149,0.3)] transition hover:translate-y-[-1px]"
        >
          <Headphones className="size-4" />
          {copy.start}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Listen (audio + speed + transcript + notes)               */
/* ------------------------------------------------------------------ */

function ListenStep({
  copy,
  material,
  onBack,
}: {
  copy: ReturnType<typeof useCopy>;
  material: ListeningMaterial;
  onBack: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<0.75 | 0.85 | 1>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [notes, setNotes] = useState("");

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.playbackRate = rate;
      el.play();
    }
    setPlaying(!playing);
  };

  const cycleRate = () => {
    const next = rate === 1 ? 0.85 : rate === 0.85 ? 0.75 : 1;
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const rateLabel = rate === 1 ? copy.normal : rate === 0.85 ? copy.slow : `0.75×`;

  return (
    <section className="mx-auto max-w-3xl space-y-5 reveal-up">
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
          <ArrowLeft className="size-4" />
          {copy.back}
        </button>
      </div>

      {/* Main listening card */}
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs text-[var(--ink-soft)]">{material.durationLabel}</span>
            <h2 className="font-display mt-2 text-2xl tracking-tight text-[var(--ink)]">{material.title}</h2>
          </div>
        </div>

        {/* Scenario */}
        <div className="mt-4 rounded-[1rem] border border-[rgba(20,50,75,0.1)] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{copy.scenario}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{material.scenario}</p>
        </div>

        {/* Audio player */}
        {material.audioSrc && (
          <>
            <audio
              ref={audioRef}
              src={material.audioSrc}
              onEnded={() => setPlaying(false)}
              preload="auto"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--navy)] text-white shadow-[0_8px_20px_rgba(28,78,149,0.3)] transition hover:translate-y-[-1px]"
              >
                {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-[1px]" />}
              </button>
              <button
                type="button"
                onClick={cycleRate}
                className="rounded-full border border-[rgba(20,50,75,0.14)] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)]"
              >
                {copy.speed}: {rateLabel}
              </button>
            </div>
          </>
        )}

        {/* Transcript toggle */}
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] transition hover:underline"
        >
          {showTranscript ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          {showTranscript ? copy.hideTranscript : copy.showTranscript}
        </button>
        {showTranscript && (
          <div className="mt-2 rounded-[1rem] border border-[rgba(20,50,75,0.1)] bg-white/70 p-4 text-sm leading-7 text-[var(--ink-soft)]">
            {material.transcript}
          </div>
        )}
      </article>

      {/* Notes */}
      <article className="surface-panel rounded-[1.8rem] p-5 sm:p-6">
        <p className="text-sm font-semibold text-[var(--ink)]">{copy.notes}</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={copy.notesPlaceholder}
          rows={4}
          className="mt-3 w-full resize-none rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink)] placeholder:text-[var(--ink-soft)]/50 focus:border-[var(--navy)]/40 focus:outline-none"
        />
      </article>

      {/* Back to selection */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.14)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.06)]"
        >
          {copy.backToSelect}
        </button>
      </div>
    </section>
  );
}
