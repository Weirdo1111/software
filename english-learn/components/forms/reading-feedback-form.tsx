"use client";

import { ArrowRight, BookMarked, BookOpen, CheckCircle2, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { ContextDock } from "@/components/context-comments/context-dock";
import {
  difficultyOptions,
  getDifficultyLabel,
  getLevelForDifficulty,
  type DifficultyLabel,
} from "@/lib/level-labels";
import { recordSkillAttemptInStorage } from "@/lib/learning-tracker";
import { getPassageForLevel, type ReadingPracticePassage } from "@/lib/reading-passages";
import type { ReadingFeedback } from "@/types/learning";

const MAX_VOCAB = 2;
type ReadingLevel = "A1" | "A2" | "B1" | "B2";


export function ReadingFeedbackForm({
  defaultLevel = "B1",
  passage,
  lessonId,
  syncPassageWithTargetLevel = false,
}: {
  defaultLevel?: ReadingLevel;
  passage: ReadingPracticePassage;
  lessonId: string;
  syncPassageWithTargetLevel?: boolean;
}) {
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "zh" ? "zh" : "en";
  const easyBaseline: "A1" | "A2" = defaultLevel === "A1" ? "A1" : "A2";
  const [targetDifficulty, setTargetDifficulty] = useState<DifficultyLabel>(getDifficultyLabel(defaultLevel));
  const [claim, setClaim] = useState("");
  const [evidence, setEvidence] = useState("");
  const [contrastSignal, setContrastSignal] = useState("");
  const [selectedVocab, setSelectedVocab] = useState<string[]>([]);
  const [result, setResult] = useState<ReadingFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vocabSaved, setVocabSaved] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const targetLevel = getLevelForDifficulty(targetDifficulty, easyBaseline) as ReadingLevel;
  const activePassage = syncPassageWithTargetLevel ? getPassageForLevel(targetLevel) : passage;
  const activeLessonId = syncPassageWithTargetLevel ? getLessonIdForLevel(targetLevel) : lessonId;
  const isReady = claim.trim().length > 5 && evidence.trim().length > 5 && contrastSignal.trim().length > 0;
  const discussionContext = useMemo(
    () => ({
      module: "reading" as const,
      targetId: `feedback:${activeLessonId}`,
      title: activePassage.title,
      subtitle: locale === "zh" ? "阅读反馈" : "Reading feedback",
      plazaTag: locale === "zh" ? "阅读" : "Reading",
      topics:
        locale === "zh"
          ? ["主张", "证据", "转折", "词汇"]
          : ["Claim", "Evidence", "Contrast", "Vocabulary"],
      starters:
        locale === "zh"
          ? [
              "我认为主张最清楚的句子是",
              "这条证据真正支持观点的原因是",
              "这里最值得记住的学术词是",
            ]
          : [
              "The clearest claim sentence is",
              "This detail works as evidence because",
              "The academic word worth saving here is",
            ],
      seedComments:
        locale === "zh"
          ? [
              {
                author: "Tutor note",
                topic: "主张",
                content: "先找最能概括全文的句子，再看其他句子是不是在解释它。",
                createdAt: "2026-03-24T07:55:00.000Z",
                likes: 4,
              },
              {
                author: "Mia",
                topic: "词汇",
                content: "我会先选能在 seminar 里复用的词，不只挑最难的词。",
                createdAt: "2026-03-24T10:10:00.000Z",
                likes: 2,
              },
            ]
          : [
              {
                author: "Tutor note",
                topic: "Claim",
                content:
                  "Find the sentence that can summarize the whole passage before you judge the details.",
                createdAt: "2026-03-24T07:55:00.000Z",
                likes: 4,
              },
              {
                author: "Mia",
                topic: "Vocabulary",
                content:
                  "I save terms that I can reuse in seminars, not only the hardest words in the text.",
                createdAt: "2026-03-24T10:10:00.000Z",
                likes: 2,
              },
            ],
    }),
    [activeLessonId, activePassage.title, locale],
  );

  function handleTargetDifficultyChange(nextDifficulty: DifficultyLabel) {
    setTargetDifficulty(nextDifficulty);

    if (!syncPassageWithTargetLevel) return;

    setClaim("");
    setEvidence("");
    setContrastSignal("");
    setSelectedVocab([]);
    setResult(null);
    setStatus("");
    setVocabSaved(false);
    setStartedAt(Date.now());
  }

  function toggleVocab(word: string) {
    setSelectedVocab((previous) => {
      if (previous.includes(word)) return previous.filter((item) => item !== word);
      if (previous.length >= MAX_VOCAB) return previous;
      return [...previous, word];
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);
    setIsSubmitting(true);
    setVocabSaved(false);

    try {
      const response = await fetch("/api/ai/feedback/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: activePassage.paragraphs.join("\n\n"),
          answers: {
            claim,
            evidence,
            contrast_signal: contrastSignal,
            vocabulary: selectedVocab,
          },
          target_level: targetLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate reading feedback.");
      }

      setResult(data);

      const durationSec = Math.max(45, Math.round((Date.now() - startedAt) / 1000));
      const passed = (data.comprehension_score as number) >= 6;
      recordSkillAttemptInStorage("reading", {
        correct: passed,
        durationSec,
        markCompleted: true,
      });

      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: `${activeLessonId}:reading-comprehension`,
          answer_payload: {
            claim,
            evidence,
            contrast_signal: contrastSignal,
            vocabulary: selectedVocab,
            comprehension_score: data.comprehension_score,
            answer: passed,
            correct_answer: true,
          },
          duration_sec: durationSec,
        }),
      }).catch(() => {});

      if (selectedVocab.length > 0) {
        fetch("/api/review-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            words: selectedVocab.map((word) => ({
              front: word,
              back: getVocabTranslation(word),
              tag: "Reading",
            })),
          }),
        })
          .then(async (saveResponse) => {
            if (saveResponse.ok) {
              const body = await saveResponse.json().catch(() => ({}));
              if (body.persisted) setVocabSaved(true);
            }
          })
          .catch(() => {});
      }
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to generate reading feedback.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div>
        <p className="section-label">
          <BookOpen className="size-3.5" /> Reading feedback
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Identify the claim, locate evidence, and build vocabulary.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          Read the passage below, then answer the three comprehension questions and select up to two academic terms to
          add to your review deck.
        </p>
      </div>

      <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Passage</p>
          <span className="rounded-full bg-[rgba(123,75,20,0.1)] px-3 py-1 text-xs font-semibold text-[#7b4b14]">
            {activePassage.band} | {getDifficultyLabel(activePassage.level)}
          </span>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-[var(--ink)]">{activePassage.title}</h3>
        <div className="mt-3 grid gap-4">
          {activePassage.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm leading-8 text-[var(--ink)]">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Target difficulty
        <select
          value={targetDifficulty}
          onChange={(event) => handleTargetDifficultyChange(event.target.value as DifficultyLabel)}
          className="w-fit rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
        >
          {difficultyOptions.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
        <span className="text-xs font-normal leading-6 text-[var(--ink-soft)]">
          {syncPassageWithTargetLevel
            ? "Switching level loads the matching reading passage and clears the current answers."
            : "This changes the feedback target while keeping the current lesson passage fixed."}
        </span>
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Checkpoint 1 - What sentence expresses the main claim most clearly?
        <textarea
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
          placeholder="Copy or paraphrase the sentence you think states the main claim."
          className="min-h-20 rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Checkpoint 2 - Which detail functions as evidence rather than background?
        <textarea
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
          placeholder="Identify the specific detail that directly supports the main claim."
          className="min-h-20 rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Checkpoint 3 - What transition signals contrast in the passage?
        <input
          type="text"
          value={contrastSignal}
          onChange={(event) => setContrastSignal(event.target.value)}
          placeholder="e.g. However, Although, Yet"
          className="rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
        />
      </label>

      <div className="grid gap-3">
        <p className="text-sm font-medium text-[var(--ink)]">
          Vocabulary - Select up to {MAX_VOCAB} terms to add to your review deck
        </p>
        <div className="flex flex-wrap gap-2">
          {activePassage.vocab_options.map((word) => {
            const isSelected = selectedVocab.includes(word);
            const isDisabled = !isSelected && selectedVocab.length >= MAX_VOCAB;
            return (
              <button
                key={word}
                type="button"
                onClick={() => toggleVocab(word)}
                disabled={isDisabled}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-[#7b4b14] bg-[#7b4b14] text-white"
                    : isDisabled
                      ? "cursor-not-allowed border-[rgba(20,50,75,0.1)] bg-transparent text-[var(--ink-soft)] opacity-40"
                      : "border-[rgba(20,50,75,0.2)] bg-white/75 text-[var(--ink)] hover:border-[#7b4b14] hover:text-[#7b4b14]"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isReady}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isSubmitting ? "Analyzing answers..." : "Get reading feedback"}
      </button>

      {status ? (
        <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {status}
        </p>
      ) : null}

      {isSubmitting ? (
        <AIAnalysisState
          title="Comparing your answers with the passage structure."
          description="The reading coach is checking whether your claim, evidence, and contrast signal match the passage, then preparing vocabulary feedback and next-step tips."
          steps={[
            "Reviewing the main claim and the evidence you selected.",
            "Checking the contrast signal and the vocabulary choices against the passage.",
            "Preparing a comprehension score with targeted coaching advice.",
          ]}
        />
      ) : null}

      {result ? (
        <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
          <div className="flex items-center gap-3 text-[var(--ink)]">
            <BookMarked className="size-4" />
            <p className="text-sm font-semibold">Comprehension feedback</p>
          </div>

          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Comprehension score
            </p>
            <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.comprehension_score}</p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Claim</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.claim_feedback}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Evidence</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.evidence_feedback}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Vocabulary</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.vocabulary_feedback}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-[var(--ink)]">Coach tips</p>
            {result.tips.map((tip) => (
              <div key={tip} className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                {tip}
              </div>
            ))}
          </div>

          {vocabSaved && selectedVocab.length > 0 ? (
            <div className="flex items-center gap-2 rounded-[1rem] bg-[rgba(106,148,131,0.1)] px-4 py-3 text-sm font-medium text-[#285f4d]">
              <CheckCircle2 className="size-4" />
              {selectedVocab.length === 1 ? "1 word" : `${selectedVocab.length} words`} added to your review deck
            </div>
          ) : null}
        </div>
      ) : null}

      <ContextDock
        key={`reading:${discussionContext.targetId}`}
        locale={locale}
        context={discussionContext}
      />
    </form>
  );
}

function getLessonIdForLevel(level: ReadingLevel) {
  return `${level}-reading-starter`;
}

function getVocabTranslation(word: string): string {
  const translations: Record<string, string> = {
    library: "library / study place on campus",
    homework: "homework / work to finish after class",
    deadline: "deadline / the final time to submit work",
    "reading task": "reading task / assigned reading activity",
    "study habit": "study habit / a regular way of learning",
    attendance: "attendance / regular class presence",
    lecture: "lecture / teacher-led class session",
    coursework: "coursework / assessed class tasks",
    assessment: "assessment / evaluation task",
    "end-of-term": "end-of-term / final stage of a module",
    longitudinal: "longitudinal / tracked across time",
    cohort: "cohort / a group studied together",
    "blended learning": "blended learning / mixed online and in-person study",
    "evidence-based": "evidence-based / supported by proof",
    "referencing accuracy": "referencing accuracy / correct citation use",
    "meta-analysis": "meta-analysis / combined analysis of many studies",
    methodological: "methodological / related to research method",
    interdisciplinary: "interdisciplinary / across different subjects",
    synthesize: "synthesize / combine ideas into one view",
    curriculum: "curriculum / planned course content",
  };

  return translations[word] ?? word;
}
