"use client";

import {
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SaveToDeckButton } from "@/components/forms/save-to-deck-button";
import {
  scoreListeningMaterial,
  tedListeningMaterials,
  type ListeningMaterial,
} from "@/lib/listening-materials";
import {
  recordListeningCompletionInStorage,
  recordListeningHistoryInStorage,
} from "@/lib/listening-library";
import { cn } from "@/lib/utils";
import type { CEFRLevel, ListeningAIFeedback } from "@/types/learning";

const tedThumbnailFallbackMap = new Map(
  tedListeningMaterials.map((material) => [material.materialGroupId, material.thumbnailUrl]),
);

function buildAnswerState(questionIds: string[]) {
  return Object.fromEntries(questionIds.map((id) => [id, ""])) as Record<string, string>;
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
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

export function TedDetail({
  material,
  defaultLevel = "B1",
  locale,
}: {
  material: ListeningMaterial;
  defaultLevel?: CEFRLevel;
  locale: string;
}) {
  const [showTedEmbed, setShowTedEmbed] = useState(false);
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
  const recordedRef = useRef(false);

  const thumbnail = getMaterialThumbnail(material);
  const noteWordCount = countWords(notes);
  const answeredCount = material.questions.filter(
    (question) => (answers[question.id] ?? "").trim().length >= 2,
  ).length;

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordListeningHistoryInStorage(material.materialGroupId);
  }, [material.materialGroupId]);

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: `${material.id}:ted-listening-check`,
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
            href={`/listening/ted?lang=${locale}`}
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
            <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
              Level {material.recommendedLevel}
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{material.scenario}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {material.embedUrl ? (
            <button
              type="button"
              onClick={() => setShowTedEmbed((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3]"
            >
              <PlayCircle className="size-4" />
              {showTedEmbed ? "Hide preview" : "Preview this talk"}
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
              Watch on TED
            </a>
          ) : null}

          {material.transcriptUrl ? (
            <a
              href={material.transcriptUrl}
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

      {/* Video + Notes section */}
      <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
          <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[var(--navy)]">
            <div className="relative aspect-video">
              {showTedEmbed && material.embedUrl ? (
                <iframe
                  key={material.embedUrl}
                  src={material.embedUrl}
                  title={material.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]">
                  {thumbnail ? (
                    <TedThumbnail src={thumbnail} alt={material.title} />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,17,28,0.82)] via-[rgba(8,17,28,0.24)] to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h4 className="text-xl font-semibold tracking-tight text-white">
                      {material.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {material.speakerName} · {material.durationLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

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
              tag={`ted-listening:${material.majorId}`}
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
              {answeredCount}/{material.questions.length} · {defaultLevel}
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            {material.questions.map((question, index) => (
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
              {result.passed ? "Ready for another talk" : "Review and try again"}
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
            description="The listening coach is checking your answers against the TED talk's argument structure, then preparing personalised feedback and tips."
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
