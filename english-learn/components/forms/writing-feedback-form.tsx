"use client";

import Link from "next/link";
import { ArrowRight, FilePenLine, LoaderCircle, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { ContextDock } from "@/components/context-comments/context-dock";
import { SaveToDeckButton } from "@/components/forms/save-to-deck-button";
import {
  difficultyOptions,
  getDifficultyLabel,
  getLevelForDifficulty,
  type DifficultyLabel,
} from "@/lib/level-labels";
import { writingDisciplineLabels, type WritingDiscipline } from "@/lib/writing-language-bank";
import {
  getWritingPromptById,
  getWritingPromptsForLevelAndDiscipline,
} from "@/lib/writing-prompts";
import type { CEFRLevel, WritingFeedback } from "@/types/learning";

const disciplines: WritingDiscipline[] = ["computing", "transport", "maths", "mechanical", "civil"];

export function WritingFeedbackForm({ defaultLevel = "B1" }: { defaultLevel?: CEFRLevel }) {
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "zh" ? "zh" : "en";

  const wc = locale === "zh" ? {
    label: "写作反馈",
    heading: "检查观点逻辑、语言准确性与修改质量。",
    guideTitle: "使用指南",
    guide: "选择一个场景，写一段150-200词的段落，包含清晰的主题句、一条解释和一个具体例子，然后使用AI反馈进行修改。",
    levelLabel: "目标难度",
    disciplineLabel: "专业方向",
    scenarioLabel: "练习场景",
    scenarioSub: "场景",
    promptSub: "写作提示",
    focusSub: "练习重点",
    promptReviewButton: "查看这道题之前的 review",
    draftLabel: "草稿段落",
    submitting: "正在分析...",
    submit: "获取写作反馈",
    analyzing: "正在审阅你的段落并生成修改建议。",
    analyzingDesc: "写作教练正在检查你在目标难度上的观点控制、语法和词汇，并生成修改示例。",
    steps: ["阅读你的段落，识别主要论点。", "对比目标等级的句式控制、语法和词汇。", "准备优先修改建议和更强的修改示例。"],
    revisionTitle: "修改建议",
    overallScore: "总体得分",
  } : {
    label: "Writing feedback",
    heading: "Check idea control, language accuracy, and revision quality.",
    guideTitle: "Quick guide",
    guide: "Choose a scenario, write one focused 150-200 word paragraph with a clear topic sentence, one explanation, and one concrete example, then use the AI feedback to revise.",
    levelLabel: "Target difficulty",
    disciplineLabel: "Major",
    scenarioLabel: "Practice scenario",
    scenarioSub: "Scenario",
    promptSub: "Prompt",
    focusSub: "Focus",
    promptReviewButton: "View earlier review for this prompt",
    draftLabel: "Draft paragraph",
    submitting: "Analyzing draft...",
    submit: "Get writing feedback",
    analyzing: "Reviewing your paragraph and building revision guidance.",
    analyzingDesc: "The writing coach is checking idea control, grammar, and vocabulary at your selected difficulty before generating a cleaner rewrite sample.",
    steps: ["Reading your paragraph and identifying the main argument.", "Comparing sentence control, grammar, and vocabulary to the target level.", "Preparing priority fixes and a stronger revision example."],
    revisionTitle: "Revision guidance",
    overallScore: "Overall score",
  };
  const easyBaseline: "A1" | "A2" = defaultLevel === "A1" ? "A1" : "A2";
  const initialDifficulty = getDifficultyLabel(defaultLevel);
  const initialLevel = getLevelForDifficulty(initialDifficulty, easyBaseline);

  const [selectedDiscipline, setSelectedDiscipline] = useState<WritingDiscipline>("computing");
  const initialPrompt =
    getWritingPromptsForLevelAndDiscipline(initialLevel, "computing")[0] ?? getWritingPromptById("b1-english-medium-support");
  const [targetDifficulty, setTargetDifficulty] = useState<DifficultyLabel>(initialDifficulty);
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(initialLevel);
  const [selectedPromptId, setSelectedPromptId] = useState(initialPrompt?.id ?? "b1-english-medium-support");
  const [essay, setEssay] = useState(initialPrompt?.sample_response ?? "");
  const [result, setResult] = useState<WritingFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePrompts = getWritingPromptsForLevelAndDiscipline(targetLevel, selectedDiscipline);
  const selectedPrompt =
    getWritingPromptById(selectedPromptId) ?? availablePrompts[0] ?? getWritingPromptById("b1-english-medium-support");
  const discussionContext = {
    module: "writing" as const,
    targetId: selectedPromptId,
    title: selectedPrompt?.title ?? wc.label,
    subtitle: wc.label,
    plazaTag: locale === "zh" ? "写作" : "Writing",
    topics:
      locale === "zh"
        ? ["论点", "衔接", "例子", "语法"]
        : ["Thesis", "Cohesion", "Example", "Grammar"],
    starters:
      locale === "zh"
        ? [
            "我这一句 thesis 还可以怎么写",
            "这个例子不够具体的地方是",
            "这里最需要改的衔接是",
          ]
        : [
            "A clearer thesis sentence could be",
            "The example becomes specific when",
            "The transition I should fix here is",
          ],
    seedComments:
      locale === "zh"
        ? [
            {
              author: "Tutor note",
              topic: "论点",
              content: "先把立场写得直接一点，再补解释，整段会更稳。",
              createdAt: "2026-03-24T08:05:00.000Z",
              likes: 4,
            },
            {
              author: "Rina",
              topic: "例子",
              content: "我发现例子只要写到具体场景，AI 反馈会更聚焦。",
              createdAt: "2026-03-24T11:15:00.000Z",
              likes: 3,
            },
          ]
        : [
            {
              author: "Tutor note",
              topic: "Thesis",
              content:
                "State the position more directly before you explain it. The whole paragraph reads stronger.",
              createdAt: "2026-03-24T08:05:00.000Z",
              likes: 4,
            },
            {
              author: "Rina",
              topic: "Example",
              content:
                "Once I make the example concrete, the AI feedback becomes much more useful.",
              createdAt: "2026-03-24T11:15:00.000Z",
              likes: 3,
            },
          ],
  };

  if (!selectedPrompt) return null;

  function loadPrompt(nextPromptId: string) {
    const nextPrompt = getWritingPromptById(nextPromptId);
    if (!nextPrompt) return;

    setSelectedPromptId(nextPrompt.id);
    setEssay(nextPrompt.sample_response);
    setResult(null);
    setStatus("");
  }

  function handleTargetDifficultyChange(nextDifficulty: DifficultyLabel) {
    const nextLevel = getLevelForDifficulty(nextDifficulty, easyBaseline);
    const nextPrompts = getWritingPromptsForLevelAndDiscipline(nextLevel, selectedDiscipline);
    const nextPrompt = nextPrompts[0] ?? selectedPrompt;

    setTargetDifficulty(nextDifficulty);
    setTargetLevel(nextLevel);
    if (nextPrompt) {
      loadPrompt(nextPrompt.id);
    }
  }

  function handleDisciplineChange(nextDiscipline: WritingDiscipline) {
    const nextPrompts = getWritingPromptsForLevelAndDiscipline(targetLevel, nextDiscipline);
    const nextPrompt = nextPrompts[0] ?? getWritingPromptById("b1-english-medium-support");

    setSelectedDiscipline(nextDiscipline);
    if (nextPrompt) {
      loadPrompt(nextPrompt.id);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/feedback/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay_text: essay,
          target_level: targetLevel,
          prompt_id: selectedPrompt.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate writing feedback.");
      }

      setResult(data);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to generate writing feedback.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const fullFeedbackEntry = result
    ? [
        `${locale === "zh" ? "Overall score" : "Overall score"}: ${result.overall_score}`,
        `${locale === "zh" ? "Priority fixes" : "Priority fixes"}: ${result.errors.join(" | ")}`,
        `${locale === "zh" ? "Rewrite sample" : "Rewrite sample"}: ${result.rewrite_sample}`,
      ].join("\n\n")
    : "";

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="section-label">
            <FilePenLine className="size-3.5" /> {wc.label}
          </p>
          <LanguageSwitcher locale={locale} />
        </div>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{wc.heading}</h2>
        <div className="mt-4 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{wc.guideTitle}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{wc.guide}</p>
        </div>
      </div>

      <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-4">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            {wc.levelLabel}
            <select
              value={targetDifficulty}
              onChange={(event) => handleTargetDifficultyChange(event.target.value as DifficultyLabel)}
              className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
            >
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            {wc.disciplineLabel}
            <select
              value={selectedDiscipline}
              onChange={(event) => handleDisciplineChange(event.target.value as WritingDiscipline)}
              className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
            >
              {disciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {writingDisciplineLabels[discipline]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            {wc.scenarioLabel}
            <select
              value={selectedPrompt.id}
              onChange={(event) => loadPrompt(event.target.value)}
              className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
            >
              {availablePrompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 rounded-[1.2rem] bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{wc.scenarioSub}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{selectedPrompt.scenario}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{wc.promptSub}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{selectedPrompt.prompt}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{wc.focusSub}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{selectedPrompt.skill_focus}</p>
          <Link
            href={`/review?tag=Writing&prompt=${encodeURIComponent(selectedPrompt.title)}&scenario=${encodeURIComponent(selectedPrompt.scenario)}&task=${encodeURIComponent(selectedPrompt.prompt)}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
          >
            {wc.promptReviewButton}
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          {wc.draftLabel}
          <textarea
            value={essay}
            onChange={(event) => setEssay(event.target.value)}
            className="min-h-40 rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm leading-7 outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || essay.trim().length < 20}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isSubmitting ? wc.submitting : wc.submit}
      </button>

      {status ? <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">{status}</p> : null}

      {isSubmitting ? (
        <AIAnalysisState
          title={wc.analyzing}
          description={wc.analyzingDesc}
          steps={wc.steps}
        />
      ) : null}

      {result ? (
        <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
          <div className="flex items-center gap-3 text-[var(--ink)]">
            <WandSparkles className="size-4" />
            <p className="text-sm font-semibold">{wc.revisionTitle}</p>
          </div>
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{wc.overallScore}</p>
            <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.overall_score}</p>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-[var(--ink)]">{locale === "zh" ? "优先修改项" : "Priority fixes"}</p>
            {result.errors.map((error) => (
              <div key={error} className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                {error}
              </div>
            ))}
          </div>
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{locale === "zh" ? "修改示例" : "Rewrite sample"}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.rewrite_sample}</p>
          </div>
          <SaveToDeckButton
            tag="Writing"
            items={[
              {
                front: selectedPrompt.title,
                back: fullFeedbackEntry,
              },
            ]}
          />
        </div>
      ) : null}

      <ContextDock
        key={`writing:${discussionContext.targetId}`}
        locale={locale}
        context={discussionContext}
      />
    </form>
  );
}
