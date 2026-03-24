import { Ear, FileText, Mic, PenLine, Target } from "lucide-react";

import { ListeningFeedbackForm } from "@/components/forms/listening-feedback-form";
import { ReadingFeedbackForm } from "@/components/forms/reading-feedback-form";
import { SpeakingFeedbackForm } from "@/components/forms/speaking-feedback-form";
import { SpeakingHub } from "@/components/forms/speaking-hub";
import { WritingFeedbackForm } from "@/components/forms/writing-feedback-form";
import { WritingHub } from "@/components/forms/writing-hub";
import { WritingLanguageLab } from "@/components/forms/writing-language-lab";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";
import { getListeningMaterialsCatalog } from "@/lib/listening-materials-repository";
import { buildPracticePassageFromArticle, getReadingArticleById } from "@/lib/reading-articles";
import { getPassageForLevel } from "@/lib/reading-passages";
import { isSpeakingModuleId } from "@/lib/speaking-modules";
import { isWritingModuleId } from "@/lib/writing-modules";
import type { CEFRLevel } from "@/types/learning";

type LessonMode = "listening" | "speaking" | "reading" | "writing";

function detectMode(id: string): LessonMode {
  if (id.includes("listening")) return "listening";
  if (id.includes("speaking")) return "speaking";
  if (id.includes("reading")) return "reading";
  return "writing";
}

/** Extract the CEFR level prefix from a lesson id like "B1-reading-starter" */
function extractLevel(id: string): CEFRLevel {
  const match = id.match(/^(A1|A2|B1|B2)/i);
  return (match ? match[1].toUpperCase() : "B1") as CEFRLevel;
}

const modeMeta = {
  listening: {
    label: "TED Listening Library",
    icon: Ear,
    focus: "Browse official TED talks matched to DIICSU majors, then turn each video into focused note-taking and listening-check practice.",
    source: "Official TED talks with major-matched prompts, vocabulary, and listening checks for five undergraduate disciplines",
    output: "Structured notes + TED listening check + saved technical vocabulary + major-matched academic listening practice",
    coach: "Filter by major or level, preview the talk in the page, then open the official TED page when you want the best playback quality.",
    tasks: [
      "Choose a TED talk by major, level, or topic.",
      "Preview the video or open the official TED page, then take structured notes.",
      "Answer the listening questions and save useful technical terms to the deck.",
    ],
    checkpoints: [
      "What is the main claim or recommendation in the talk?",
      "Which exact detail should appear in your notes?",
      "Which specialist term or idea helped you track the speaker?",
    ],
    tone: "from-[#d7e8f7] via-white to-[#edf6fc]",
  },
  speaking: {
    label: "Academic Speaking Studio",
    icon: Mic,
    focus: "Practice seminar-style responses with clearer pronunciation and stronger spoken structure.",
    source: "Tutorial discussion prompt on student participation",
    output: "60-90 second response with one reason and one example",
    coach: "Keep sentence endings strong and use one linking phrase to hold the response together.",
    tasks: [
      "Plan one claim and one supporting example.",
      "Speak the response once without stopping.",
      "Use AI feedback to revise and record again.",
    ],
    checkpoints: [
      "Did the response open with a clear position?",
      "Was the supporting example specific enough?",
      "Were sentence endings audible and controlled?",
    ],
    tone: "from-[#dff1e6] via-white to-[#eff8f3]",
  },
  reading: {
    label: "Academic Reading Studio",
    icon: FileText,
    focus: "Map argument structure, identify evidence, and track academic vocabulary in context.",
    source: "Short abstract and commentary on remote study habits",
    output: "Claim-evidence map + vocabulary notes",
    coach: "Skim for structure, then return for evidence and key terms.",
    tasks: [
      "Locate the author's main claim.",
      "Mark one supporting detail.",
      "Choose up to two academic terms.",
    ],
    checkpoints: [
      "What sentence expresses the main claim most clearly?",
      "Which detail functions as evidence rather than background?",
      "What transition signals contrast in the passage?",
    ],
    tone: "from-[#f7ead2] via-white to-[#fdf5e8]",
  },
  writing: {
    label: "Academic Writing Studio",
    icon: PenLine,
    focus: "Draft a short analytical paragraph with clearer cohesion, sentence control, and revision discipline.",
    source: "Selectable academic writing practice scenarios",
    output: "150-200 word paragraph with one clear solution",
    coach: "Make the topic sentence explicit, then keep every sentence tied to that point.",
    tasks: [
      "Draft a topic sentence with one clear claim.",
      "Add a supporting explanation and one concrete example.",
      "Use AI feedback to revise grammar and cohesion.",
    ],
    checkpoints: [
      "Does the first sentence state a clear analytical point?",
      "Is there at least one concrete support sentence?",
      "Do transitions link the paragraph logically?",
    ],
    tone: "from-[#f6e0d9] via-white to-[#fff1ec]",
  },
} as const;

function renderWorkbench(
  mode: LessonMode,
  lessonId: string,
  listeningMaterials: Awaited<ReturnType<typeof getListeningMaterialsCatalog>> | null,
  locale: "zh" | "en",
  speakingModule?: string,
  articleId?: string,
) {
  const level = extractLevel(lessonId);

  if (mode === "speaking") {
    if (!isSpeakingModuleId(speakingModule)) {
      return <SpeakingHub locale={locale} lessonId={lessonId} />;
    }

    return (
      <SpeakingFeedbackForm
        defaultLevel={level}
        module={speakingModule}
        locale={locale}
        hubHref={`/lesson/${lessonId}?lang=${locale}`}
      />
    );
  }

  if (mode === "listening") {
    return <ListeningFeedbackForm defaultLevel={level} materials={listeningMaterials ?? undefined} />;
  }

  if (mode === "writing") {
    if (!isWritingModuleId(speakingModule)) {
      return <WritingHub locale={locale} lessonId={lessonId} />;
    }

    if (speakingModule === "language-lab") {
      return <WritingLanguageLab defaultLevel={level} />;
    }

    return <WritingFeedbackForm defaultLevel={level} />;
  }

  if (mode === "reading") {
    const linkedArticle = articleId ? getReadingArticleById(articleId) : undefined;
    const passage = linkedArticle ? buildPracticePassageFromArticle(linkedArticle) : getPassageForLevel(level);
    const readingLessonId = linkedArticle ? `${lessonId}:${linkedArticle.id}` : lessonId;

    return <ReadingFeedbackForm defaultLevel={level} passage={passage} lessonId={readingLessonId} />;
  }

  return null;
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string; articleId?: string; module?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale(resolvedSearchParams);
  const mode = detectMode(resolvedParams.id);
  const level = extractLevel(resolvedParams.id);
  const meta = modeMeta[mode];
  const linkedArticle =
    mode === "reading" && resolvedSearchParams.articleId
      ? getReadingArticleById(resolvedSearchParams.articleId)
      : undefined;
  const readingPassage =
    mode === "reading"
      ? linkedArticle
        ? buildPracticePassageFromArticle(linkedArticle)
        : getPassageForLevel(level)
      : null;
  const sourceTitle = readingPassage?.title ?? meta.source;
  const description = linkedArticle?.focus ?? meta.focus;
  const Icon = meta.icon;
  const isWritingMode = mode === "writing";
  const isListeningMode = mode === "listening";
  const isReadingMode = mode === "reading";
  const topSectionLayoutClass =
    mode === "speaking" || isWritingMode || isReadingMode ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1.02fr_0.98fr]";
  const lessonMetaGridClass =
    isWritingMode || isReadingMode ? "mt-6 grid gap-3" : "mt-6 grid gap-3 sm:grid-cols-2";
  const lowerSectionLayoutClass =
    isWritingMode || isReadingMode ? "mt-6 grid gap-5" : "mt-6 grid gap-5 lg:grid-cols-[1.02fr_0.98fr]";
  const listeningMaterials = isListeningMode ? await getListeningMaterialsCatalog() : null;
  const showStandaloneLessonBrief = mode !== "speaking" && mode !== "writing" && mode !== "listening";
  const showLowerPanels = mode !== "speaking" && mode !== "listening" && mode !== "writing";
  const showPageHeader = false;
  // Date: 2026/3/18
  // Author: Tianbo Cao
  // Keep the speaking lesson page focused on the core studio by hiding the extra lesson framing panels and shared page header.

  return (
    <PageFrame locale={locale} title={meta.label} description={description} showHeader={showPageHeader}>
      {showStandaloneLessonBrief ? (
        <>
          <div className={topSectionLayoutClass}>
            <article className={`rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br ${meta.tone} p-6 sm:p-7 shadow-[0_20px_45px_rgba(23,32,51,0.08)]`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">Lesson brief</p>
                  <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{sourceTitle}</h2>
                </div>
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--navy)] text-[#f7efe3]">
                  <Icon className="size-5" />
                </div>
              </div>
              <div className={lessonMetaGridClass}>
                <div className="rounded-[1.3rem] border border-white/60 bg-white/65 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Output</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{meta.output}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/60 bg-white/65 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Focus</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{meta.coach}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {meta.tasks.slice(0, 2).map((task, index) => (
                  <div
                    key={task}
                    className={`grid gap-3 rounded-[1.4rem] border border-white/60 bg-white/68 p-4 ${
                      isReadingMode ? "" : "sm:grid-cols-[auto_1fr] sm:items-start"
                    }`}
                  >
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--navy)] text-sm font-semibold text-[#f7efe3]">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-[var(--ink)]">{task}</p>
                  </div>
                ))}
              </div>
            </article>

            {renderWorkbench(
              mode,
              resolvedParams.id,
              listeningMaterials,
              locale,
              resolvedSearchParams.module,
              linkedArticle?.id,
            )}
          </div>
        </>
      ) : (
        renderWorkbench(
          mode,
          resolvedParams.id,
          listeningMaterials,
          locale,
          resolvedSearchParams.module,
          linkedArticle?.id,
        )
      )}

      {showLowerPanels ? (
        <section className={lowerSectionLayoutClass}>
          <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="section-label">
              <Target className="size-3.5" /> Checkpoints
            </p>
            <h2 className="font-display mt-4 text-2xl tracking-tight text-[var(--ink)]">What to check.</h2>
            <div className="mt-5 grid gap-3">
              {meta.checkpoints.slice(0, 2).map((item) => (
                <div key={item} className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
                  {item}
                </div>
              ))}
            </div>
          </article>

          {!isReadingMode ? (
            <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Cross-skill booster</p>
              <h2 className="font-display mt-4 text-3xl tracking-tight">Every lesson should reinforce another skill.</h2>
              <div className="mt-6 grid gap-3 text-sm leading-7 text-[#efe5d6]/78">
                <p>Listening lessons feed better seminar speaking because note quality improves idea recall.</p>
                <p>Reading lessons strengthen writing because claim-evidence structures become easier to imitate.</p>
                <p>Speaking and writing feedback creates the evidence needed for future reassessment decisions.</p>
              </div>
            </article>
          ) : null}
        </section>
      ) : null}
    </PageFrame>
  );
}
