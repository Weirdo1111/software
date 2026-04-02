"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  Mic,
  PlayCircle,
  RefreshCcw,
} from "lucide-react";

import { useShadowingPractice } from "@/components/forms/listening/use-shadowing-practice";
import {
  buildListeningCoverDataUrl,
  buildMediaProxyUrl,
  scoreListeningMaterial,
  type ListeningMaterial,
  type ListeningScoreResult,
} from "@/lib/listening-materials";
import { recordListeningCompletionInStorage } from "@/lib/listening-library";
import { recordSkillAttemptInStorage } from "@/lib/learning-tracker";
import { getDifficultyLabel } from "@/lib/level-labels";
import { cn } from "@/lib/utils";

type Locale = "zh" | "en";

interface ListeningTestMaterialResult {
  material: ListeningMaterial;
  score: ListeningScoreResult;
}

interface ListeningTestSession {
  materials: ListeningMaterial[];
  answers: Record<string, string>;
  startedAt: number;
}

function buildQuestionKey(materialGroupId: string, questionId: string) {
  return `${materialGroupId}::${questionId}`;
}

function dedupeTedMaterials(materials: ListeningMaterial[]) {
  const seenGroupIds = new Set<string>();

  return materials.filter((material) => {
    if (material.contentMode !== "ted") return false;

    const normalizedGroupId = material.materialGroupId.trim().toLowerCase();
    if (seenGroupIds.has(normalizedGroupId)) return false;

    seenGroupIds.add(normalizedGroupId);
    return true;
  });
}

function pickRandomMaterials(materials: ListeningMaterial[], count: number) {
  if (materials.length <= count) return [...materials];

  const pool = [...materials];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[nextIndex]] = [pool[nextIndex], pool[index]];
  }

  return pool.slice(0, count);
}

function buildAnswerState(materials: ListeningMaterial[]) {
  const entries: Array<[string, string]> = [];

  for (const material of materials) {
    for (const question of material.questions) {
      entries.push([buildQuestionKey(material.materialGroupId, question.id), ""]);
    }
  }

  return Object.fromEntries(entries);
}

function buildSession(materials: ListeningMaterial[]) {
  const selectedMaterials = pickRandomMaterials(materials, 2);

  return {
    materials: selectedMaterials,
    answers: buildAnswerState(selectedMaterials),
    startedAt: Date.now(),
  } satisfies ListeningTestSession;
}

function getMaterialCover(material: ListeningMaterial) {
  const generatedCover = buildListeningCoverDataUrl(material);

  if (typeof material.thumbnailUrl === "string" && material.thumbnailUrl.trim().length > 0) {
    return buildMediaProxyUrl(material.thumbnailUrl) ?? material.thumbnailUrl;
  }

  return generatedCover;
}

function getAnswerValue(session: ListeningTestSession, material: ListeningMaterial, questionId: string) {
  return session.answers[buildQuestionKey(material.materialGroupId, questionId)] ?? "";
}

function buildMaterialAnswers(session: ListeningTestSession, material: ListeningMaterial) {
  const entries = material.questions.map((question) => [
    question.id,
    getAnswerValue(session, material, question.id),
  ]);

  return Object.fromEntries(entries) as Record<string, string>;
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

export function ListeningTestModule({
  locale,
  materials,
}: {
  locale: Locale;
  materials: ListeningMaterial[];
}) {
  const copy =
    locale === "zh"
      ? {
          title: "听力测试模块",
          subtitle: "每次测试随机抽取 2 条 TED 听力材料（共 60 条题库），完成相关问题后自动评分。",
          totalPoolLabel: "题库总量",
          totalPoolSuffix: "条 TED 听力",
          selectedLabel: "本次抽题",
          selectedSuffix: "条材料",
          answeredLabel: "已作答",
          answeredSuffix: "题",
          regenerate: "重新随机抽题",
          submit: "提交测试并评分",
          notEnough: "当前 TED 听力材料不足 2 条，无法生成测试。",
          noMaterials: "当前没有可用于测试的 TED 听力材料。",
          sourcePage: "打开来源页面",
          transcript: "打开文本页面",
          preview: "站内预览",
          hidePreview: "隐藏预览",
          questionPrefix: "题",
          overallResult: "总评分",
          perTalkResult: "单条材料得分",
          passed: "测试通过",
          review: "建议复习后重测",
          yourAnswer: "你的回答",
          modelAnswer: "参考答案",
          matched: "匹配",
          needReview: "待改进",
          voiceInput: "语音输入",
          stopVoiceInput: "停止录音",
          recording: "正在语音输入…",
          voiceUnsupported: "当前浏览器不支持语音输入，建议使用 Chrome 或 Edge。",
          voiceErrorPrefix: "语音输入异常：",
        }
      : {
          title: "Listening Test Module",
          subtitle:
            "Each test randomly selects 2 TED materials from the 60-item pool and scores the related listening questions.",
          totalPoolLabel: "Pool size",
          totalPoolSuffix: "TED materials",
          selectedLabel: "Selected",
          selectedSuffix: "materials this test",
          answeredLabel: "Answered",
          answeredSuffix: "questions",
          regenerate: "Regenerate random test",
          submit: "Submit and score",
          notEnough: "Fewer than 2 TED materials are available, so the test cannot be generated.",
          noMaterials: "No TED materials are currently available for testing.",
          sourcePage: "Open source page",
          transcript: "Open transcript",
          preview: "In-app preview",
          hidePreview: "Hide preview",
          questionPrefix: "Q",
          overallResult: "Overall score",
          perTalkResult: "Per-material score",
          passed: "Passed",
          review: "Review and retry",
          yourAnswer: "Your answer",
          modelAnswer: "Model answer",
          matched: "Matched",
          needReview: "Review",
          voiceInput: "Voice input",
          stopVoiceInput: "Stop recording",
          recording: "Recording to text...",
          voiceUnsupported: "Voice input is not available in this browser. Try Chrome or Edge.",
          voiceErrorPrefix: "Voice input error: ",
        };

  const tedPool = useMemo(() => dedupeTedMaterials(materials), [materials]);
  const [session, setSession] = useState<ListeningTestSession>(() => buildSession(tedPool));
  const [previewMap, setPreviewMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [results, setResults] = useState<ListeningTestMaterialResult[] | null>(null);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const {
    isSupported: isVoiceInputSupported,
    status: voiceInputStatus,
    error: voiceInputError,
    startListening,
    stopListening,
    resetListening,
  } = useShadowingPractice();

  const totalQuestionCount = session.materials.reduce(
    (sum, material) => sum + material.questions.length,
    0,
  );
  const answeredCount = session.materials.reduce(
    (sum, material) =>
      sum +
      material.questions.filter(
        (question) =>
          getAnswerValue(session, material, question.id).trim().length >= 2,
      ).length,
    0,
  );

  const summary = useMemo(() => {
    if (!results) return null;

    const totalQuestions = results.reduce(
      (sum, item) => sum + item.score.totalQuestions,
      0,
    );
    const correctCount = results.reduce((sum, item) => sum + item.score.correctCount, 0);
    const percentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const overallOnTen =
      totalQuestions > 0
        ? Math.round(((correctCount / totalQuestions) * 10) * 10) / 10
        : 0;
    const passed = overallOnTen >= 6;

    return {
      totalQuestions,
      correctCount,
      percentage,
      overallOnTen,
      passed,
    };
  }, [results]);

  useEffect(() => {
    if (voiceInputStatus !== "listening" && activeVoiceField !== null) {
      setActiveVoiceField(null);
    }
  }, [activeVoiceField, voiceInputStatus]);

  function regenerateTestSession() {
    startTransition(() => {
      resetListening();
      setActiveVoiceField(null);
      setSession(buildSession(tedPool));
      setPreviewMap({});
      setResults(null);
      setSubmitStatus("");
    });
  }

  function handleAnswerChange(material: ListeningMaterial, questionId: string, value: string) {
    const key = buildQuestionKey(material.materialGroupId, questionId);

    setSession((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [key]: value,
      },
    }));
  }

  function togglePreview(materialGroupId: string) {
    setPreviewMap((current) => ({
      ...current,
      [materialGroupId]: !current[materialGroupId],
    }));
  }

  function startVoiceInputForQuestion(material: ListeningMaterial, questionId: string) {
    const fieldKey = buildQuestionKey(material.materialGroupId, questionId);
    const { primary, fallback } = getPreferredSpeechLocales(material.accent);

    if (voiceInputStatus === "listening") {
      resetListening();
    }

    setActiveVoiceField(fieldKey);
    startListening(primary, {
      initialText: getAnswerValue(session, material, questionId),
      continuous: true,
      fallbackLocale: fallback,
      stopOnSilence: false,
      onTranscriptChange: (transcript) => {
        handleAnswerChange(material, questionId, transcript);
      },
    });
  }

  function toggleVoiceInputForQuestion(material: ListeningMaterial, questionId: string) {
    const fieldKey = buildQuestionKey(material.materialGroupId, questionId);

    if (voiceInputStatus === "listening" && activeVoiceField === fieldKey) {
      stopListening();
      return;
    }

    startVoiceInputForQuestion(material, questionId);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (voiceInputStatus === "listening") {
      stopListening();
    }

    if (session.materials.length < 2) {
      setSubmitStatus(copy.notEnough);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const scoredResults = session.materials.map((material) => ({
        material,
        score: scoreListeningMaterial(
          material,
          buildMaterialAnswers(session, material),
          "",
          material.recommendedLevel,
        ),
      }));

      setResults(scoredResults);

      const durationSec = Math.max(60, Math.round((Date.now() - session.startedAt) / 1000));
      scoredResults.forEach(({ material, score }) => {
        recordListeningCompletionInStorage(
          material.materialGroupId,
          score.overallScore,
          score.passed,
        );
        recordSkillAttemptInStorage("listening", {
          correct: score.passed,
          durationSec,
          markCompleted: true,
        });

        fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_id: `${material.id}:listening-test`,
            answer_payload: {
              mode: "test",
              score: score.overallScore,
              answers: buildMaterialAnswers(session, material),
              answer: score.passed,
              correct_answer: true,
            },
            duration_sec: durationSec,
          }),
        }).catch(() => {});
      });
    } catch (error) {
      setSubmitStatus(
        error instanceof Error
          ? error.message
          : locale === "zh"
            ? "测试评分失败，请重试。"
            : "Failed to score the listening test. Please retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (tedPool.length === 0) {
    return (
      <section className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-6 shadow-[0_18px_38px_rgba(18,32,52,0.06)]">
        <p className="text-sm font-semibold text-[var(--ink)]">{copy.noMaterials}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6">
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">{copy.title}</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{copy.subtitle}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
          <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
            {copy.totalPoolLabel}: {tedPool.length} {copy.totalPoolSuffix}
          </span>
          <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
            {copy.selectedLabel}: {session.materials.length} {copy.selectedSuffix}
          </span>
          <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
            {copy.answeredLabel}: {answeredCount}/{totalQuestionCount} {copy.answeredSuffix}
          </span>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={regenerateTestSession}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
          >
            <RefreshCcw className="size-4" />
            {copy.regenerate}
          </button>
        </div>
      </article>

      <form onSubmit={onSubmit} className="grid gap-5">
        {session.materials.map((material, index) => {
          const showPreview = previewMap[material.materialGroupId] ?? false;
          const cover = getMaterialCover(material);
          const materialResult = results?.find(
            (item) => item.material.materialGroupId === material.materialGroupId,
          );

          return (
            <article
              key={material.materialGroupId}
              className="rounded-[2rem] border border-[rgba(20,50,75,0.12)] bg-white p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6"
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    {locale === "zh" ? "测试材料" : "Test material"} {index + 1}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">
                    {material.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    {material.speakerName
                      ? `${material.speakerName} · ${material.durationLabel}`
                      : material.durationLabel}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{material.scenario}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
                    <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
                      {material.majorLabel}
                    </span>
                    <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
                      {material.accentLabel}
                    </span>
                    <span className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] px-3 py-1.5">
                      {getDifficultyLabel(material.recommendedLevel)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {material.embedUrl ? (
                      <button
                        type="button"
                        onClick={() => togglePreview(material.materialGroupId)}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3]"
                      >
                        <PlayCircle className="size-4" />
                        {showPreview ? copy.hidePreview : copy.preview}
                      </button>
                    ) : null}

                    {material.officialUrl ? (
                      <a
                        href={material.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
                      >
                        <ExternalLink className="size-4" />
                        {copy.sourcePage}
                      </a>
                    ) : null}

                    {material.transcriptUrl ? (
                      <a
                        href={material.transcriptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
                      >
                        <FileText className="size-4" />
                        {copy.transcript}
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-gradient-to-br from-[#23425c] via-[#11273f] to-[#08131f]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={material.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {showPreview && material.embedUrl ? (
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[rgba(20,50,75,0.12)]">
                  <div className="relative aspect-video">
                    <iframe
                      src={material.embedUrl}
                      title={material.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4">
                {material.questions.map((question, questionIndex) => {
                  const voiceFieldId = buildQuestionKey(material.materialGroupId, question.id);
                  const isRecordingThisField =
                    voiceInputStatus === "listening" && activeVoiceField === voiceFieldId;

                  return (
                    <label
                      key={`${material.materialGroupId}:${question.id}`}
                      className="rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.88)] p-4"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        {copy.questionPrefix} {questionIndex + 1}
                      </span>
                      <span className="mt-2 block text-sm font-semibold leading-6 text-[var(--ink)]">
                        {question.prompt}
                      </span>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVoiceInputForQuestion(material, question.id)}
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
                          {isRecordingThisField ? copy.stopVoiceInput : copy.voiceInput}
                        </button>
                        {isRecordingThisField ? (
                          <span className="text-xs font-semibold text-[var(--ink-soft)]">
                            {copy.recording}
                          </span>
                        ) : null}
                      </div>
                      <textarea
                        value={getAnswerValue(session, material, question.id)}
                        onChange={(event) =>
                          handleAnswerChange(material, question.id, event.target.value)
                        }
                        rows={3}
                        placeholder={question.placeholder}
                        className="mt-3 w-full rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-white px-4 py-3 text-sm leading-7 outline-none"
                      />
                    </label>
                  );
                })}
              </div>

              {materialResult ? (
                <div className="mt-5 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.9)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    {copy.perTalkResult}
                  </p>
                  <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">
                    {materialResult.score.overallScore}/10
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {materialResult.score.correctCount}/{materialResult.score.totalQuestions}
                  </p>

                  <div className="mt-4 grid gap-3">
                    {materialResult.score.questionFeedback.map((feedback) => (
                      <article
                        key={`${material.materialGroupId}:${feedback.id}`}
                        className="rounded-[1rem] border border-white/70 bg-white/80 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--ink)]">{feedback.prompt}</p>
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              feedback.correct
                                ? "bg-[#edf6f1] text-[#315f4f]"
                                : "bg-[#fff1e1] text-[#8d5a21]",
                            )}
                          >
                            {feedback.correct ? copy.matched : copy.needReview}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                          {copy.yourAnswer}: {feedback.answer || (locale === "zh" ? "未作答" : "No answer")}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--ink)]">
                          {copy.modelAnswer}: {feedback.modelAnswer}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}

        {submitStatus ? (
          <p className="rounded-[1rem] border border-[#e0b48a] bg-[#fff4eb] px-4 py-3 text-sm text-[#7a4517]">
            {submitStatus}
          </p>
        ) : null}
        {!isVoiceInputSupported ? (
          <p className="rounded-[1rem] border border-[#dbe4ef] bg-[#f6f9fd] px-4 py-3 text-sm text-[var(--ink-soft)]">
            {copy.voiceUnsupported}
          </p>
        ) : null}
        {voiceInputError ? (
          <p className="rounded-[1rem] border border-[#e0b48a] bg-[#fff4eb] px-4 py-3 text-sm text-[#7a4517]">
            {copy.voiceErrorPrefix}
            {voiceInputError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting || session.materials.length < 2}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {copy.submit}
          </button>
        </div>
      </form>

      {summary ? (
        <article
          className={cn(
            "rounded-[2rem] border p-5 shadow-[0_18px_38px_rgba(18,32,52,0.06)] sm:p-6",
            summary.passed
              ? "border-[#6a9483]/35 bg-[#edf6f1]"
              : "border-[#e6c59a] bg-[#fff6ec]",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            {copy.overallResult}
          </p>
          <h3 className="font-display mt-3 text-4xl tracking-tight text-[var(--ink)]">
            {summary.overallOnTen}/10 · {summary.percentage}%
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            {summary.correctCount}/{summary.totalQuestions}
            {locale === "zh" ? " 题匹配成功。" : " answers matched."}
          </p>
          <span
            className={cn(
              "mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold",
              summary.passed
                ? "bg-[#315f4f] text-white"
                : "bg-[#8d5a21] text-white",
            )}
          >
            {summary.passed ? copy.passed : copy.review}
          </span>
        </article>
      ) : null}
    </section>
  );
}
