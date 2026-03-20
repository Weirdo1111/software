import { Ear, FileText, Mic, PenLine, Target } from "lucide-react";

import { ListeningFeedbackForm } from "@/components/forms/listening-feedback-form";
import { ReadingFeedbackForm } from "@/components/forms/reading-feedback-form";
import { SpeakingFeedbackForm } from "@/components/forms/speaking-feedback-form";
import { WritingFeedbackForm } from "@/components/forms/writing-feedback-form";
import { PageFrame } from "@/components/page-frame";
import { getLocale } from "@/lib/i18n/get-locale";
import { getListeningMaterialsCatalog } from "@/lib/listening-materials-repository";
import { buildPracticePassageFromArticle, getReadingArticleById } from "@/lib/reading-articles";
import { getPassageForLevel } from "@/lib/reading-passages";
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
    label: "Academic Listening Studio",
    icon: Ear,
    focus: "Move between controlled accent drills and official TED talks while keeping the same DIICSU-focused note-taking workflow.",
    source: "DIICSU listening bank plus TED official embeds matched to five undergraduate disciplines",
    output: "Structured notes + listening check + saved technical vocabulary + real-world TED exposure",
    coach: "Use accent practice for targeted control, then move into TED mode when you are ready for more natural pacing and authentic delivery.",
    tasks: [
      "Choose Accent Practice or TED Listening, then select your DIICSU major.",
      "Play the clip or open the official TED embed, take structured notes, and answer the checkpoints.",
      "Review the transcript option and save useful technical terms to the deck.",
    ],
    checkpoints: [
      "What is the main task or recommendation in the clip?",
      "Which exact detail should appear in your notes?",
      "Which specialist term or key idea helped you track the speaker?",
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
    coach: "Skim for structure first, then return for evidence and key terminology.",
    tasks: [
      "Locate the author's main claim.",
      "Mark one supporting reason and one example.",
      "Choose two academic terms to add to the review deck.",
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
    source: "Prompt on support strategies for English-medium study",
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
  articleId?: string,
) {
  const level = extractLevel(lessonId);

  if (mode === "speaking") {
    return <SpeakingFeedbackForm defaultLevel={level} />;
  }

  if (mode === "listening") {
    return <ListeningFeedbackForm defaultLevel={level} materials={listeningMaterials ?? undefined} />;
  }

  if (mode === "writing") {
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
  searchParams: Promise<{ lang?: string; articleId?: string }>;
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
  const topSectionLayoutClass = mode === "speaking" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1.02fr_0.98fr]";
  const listeningMaterials = mode === "listening" ? await getListeningMaterialsCatalog() : null;
  // Date: 2026/3/18
  // Author: Tianbo Cao
  // Keep the speaking lesson page focused on the core studio by hiding the extra lesson framing panels.
  const showLessonMetaPanels = mode !== "speaking" && mode !== "listening";

  return (
    <PageFrame locale={locale} title={meta.label} description={description}>
      {showLessonMetaPanels ? (
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
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-white/60 bg-white/65 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Expected output</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{meta.output}</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/60 bg-white/65 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Coach focus</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{meta.coach}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {meta.tasks.map((task, index) => (
                  <div key={task} className="grid gap-3 rounded-[1.4rem] border border-white/60 bg-white/68 p-4 sm:grid-cols-[auto_1fr] sm:items-start">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--navy)] text-sm font-semibold text-[#f7efe3]">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-[var(--ink)]">{task}</p>
                  </div>
                ))}
              </div>
            </article>

            {renderWorkbench(mode, resolvedParams.id, listeningMaterials, linkedArticle?.id)}
          </div>

          <section className="mt-6 grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
            <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
              <p className="section-label">
                <Target className="size-3.5" /> Checkpoints
              </p>
              <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">What success looks like in this lesson.</h2>
              <div className="mt-6 grid gap-3">
                {meta.checkpoints.map((item) => (
                  <div key={item} className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">Cross-skill booster</p>
              <h2 className="font-display mt-4 text-3xl tracking-tight">Every lesson should reinforce another skill.</h2>
              <div className="mt-6 grid gap-3 text-sm leading-7 text-[#efe5d6]/78">
                <p>Listening lessons feed better seminar speaking because note quality improves idea recall.</p>
                <p>Reading lessons strengthen writing because claim-evidence structures become easier to imitate.</p>
                <p>Speaking and writing feedback creates the evidence needed for future reassessment decisions.</p>
              </div>
            </article>
          </section>
        </>
      ) : (
        renderWorkbench(mode, resolvedParams.id, listeningMaterials, linkedArticle?.id)
      )}
    </PageFrame>
  );
}
